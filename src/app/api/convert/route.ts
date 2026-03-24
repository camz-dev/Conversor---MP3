import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"

const YT_DLP_PATH = "/home/z/.local/bin/yt-dlp"
const OUTPUT_DIR = path.join(process.cwd(), "public", "downloads")
const COOKIES_DIR = path.join(process.cwd(), "tmp", "cookies")

async function ensureDirs() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.mkdir(COOKIES_DIR, { recursive: true })
}

function parseCookiesToNetscape(cookies: string): string {
  let lines = cookies.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  
  const isNetscape = lines.some(line => line.includes('\t'))
  
  if (isNetscape) {
    return '# Netscape HTTP Cookie File\n# https://curl.haxx.se/rfc/cookie_spec.html\n' + 
           lines.filter(l => l.includes('\t')).join('\n')
  }
  
  const result: string[] = [
    '# Netscape HTTP Cookie File',
    '# https://curl.haxx.se/rfc/cookie_spec.html',
    ''
  ]
  
  if (cookies.includes('"') && cookies.includes(':')) {
    try {
      const parsed = JSON.parse(cookies)
      if (Array.isArray(parsed)) {
        for (const cookie of parsed) {
          const domain = cookie.domain || '.youtube.com'
          const flag = domain.startsWith('.') ? 'TRUE' : 'FALSE'
          const path = cookie.path || '/'
          const secure = cookie.secure ? 'TRUE' : 'FALSE'
          const expiry = cookie.expirationDate || cookie.expiryDate || 0
          const name = cookie.name || ''
          const value = cookie.value || ''
          result.push(`${domain}\t${flag}\t${path}\t${secure}\t${Math.floor(expiry)}\t${name}\t${value}`)
        }
        return result.join('\n')
      }
    } catch { /* not JSON */ }
  }
  
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const eqIndex = line.indexOf('=')
    if (eqIndex > 0) {
      const name = line.substring(0, eqIndex).trim()
      const value = line.substring(eqIndex + 1).trim()
      result.push(`.youtube.com\tTRUE\t/\tTRUE\t0\t${name}\t${value}`)
    }
  }
  
  return result.join('\n')
}

async function createCookiesFile(cookies: string): Promise<string> {
  const cookieId = randomUUID()
  const cookiePath = path.join(COOKIES_DIR, `cookies_${cookieId}.txt`)
  const cookiesContent = parseCookiesToNetscape(cookies)
  await fs.writeFile(cookiePath, cookiesContent, 'utf-8')
  return cookiePath
}

async function cleanupOldFiles() {
  try {
    const dirs = [OUTPUT_DIR, COOKIES_DIR]
    const now = Date.now()
    const maxAge = 30 * 60 * 1000
    for (const dir of dirs) {
      const files = await fs.readdir(dir).catch(() => [])
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = await fs.stat(filePath).catch(() => null)
        if (stat && now - stat.mtimeMs > maxAge) {
          await fs.unlink(filePath).catch(() => {})
        }
      }
    }
  } catch { /* ignore */ }
}

function executeYtDlp(args: string[]): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    const process = spawn(YT_DLP_PATH, args, { timeout: 600000 }) // 10 min for playlists
    let stdout = ""
    let stderr = ""
    process.stdout.on("data", (data) => { stdout += data.toString() })
    process.stderr.on("data", (data) => { stderr += data.toString() })
    process.on("close", (code) => { resolve({ stdout, stderr, code }) })
    process.on("error", (err) => { reject(err) })
  })
}

export async function POST(request: NextRequest) {
  try {
    const { url, cookies, isPlaylist } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL não fornecida" }, { status: 400 })
    }

    // Validate YouTube URL (including playlists)
    const youtubePatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/,
      /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
      /^https?:\/\/(m\.)?youtube\.com\/watch\?v=[\w-]+/,
    ]

    const isValidYouTube = youtubePatterns.some(pattern => pattern.test(url))
    if (!isValidYouTube) {
      return NextResponse.json({ error: "URL inválida. Use uma URL do YouTube válida." }, { status: 400 })
    }

    await ensureDirs()
    await cleanupOldFiles()

    const timestamp = Date.now()
    
    // For playlists, create a subfolder
    let outputFolder = OUTPUT_DIR
    if (isPlaylist) {
      outputFolder = path.join(OUTPUT_DIR, `playlist_${timestamp}`)
      await fs.mkdir(outputFolder, { recursive: true })
    }
    
    const outputPath = path.join(outputFolder, `%(playlist_index)02d_%(title)s.%(ext)s`)

    let cookieFilePath: string | null = null
    if (cookies && cookies.trim()) {
      try {
        cookieFilePath = await createCookiesFile(cookies)
      } catch {
        return NextResponse.json({ error: "Erro ao processar cookies.", needCookies: true }, { status: 400 })
      }
    }

    const args = [
      "--no-check-certificates",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "--extract-audio",
      "--audio-format", "mp3",
      "--audio-quality", "192K",
      "--no-warnings",
      "--restrict-filenames",
      "--geo-bypass",
    ]

    // Handle playlist vs single video
    if (isPlaylist) {
      args.push("--yes-playlist") // Download entire playlist
    } else {
      args.push("--no-playlist") // Single video only
    }

    if (cookieFilePath) {
      args.push("--cookies", cookieFilePath)
    }

    args.push("-o", outputPath, "--print", "%(title)s", url)

    console.log("Executing yt-dlp for", isPlaylist ? "playlist" : "single video")

    const { stdout, stderr, code } = await executeYtDlp(args)

    if (cookieFilePath) {
      await fs.unlink(cookieFilePath).catch(() => {})
    }

    if (stderr.includes("Sign in to confirm") || stderr.includes("bot")) {
      return NextResponse.json({ 
        error: "YouTube bloqueou o download.\n\n💡 Cole os cookies do navegador para desbloquear.",
        needCookies: true
      }, { status: 429 })
    }

    if (stderr.includes("page needs to be reloaded") || stderr.includes("reload")) {
      return NextResponse.json({ 
        error: "Cookies inválidos ou expirados.\n\n💡 Exporte cookies novos do navegador.",
        needCookies: true
      }, { status: 429 })
    }

    if (stderr.includes("Video unavailable") || stderr.includes("Private video")) {
      return NextResponse.json({ error: "Vídeo indisponível ou privado." }, { status: 404 })
    }

    // Count downloaded files
    let downloadedFiles: string[] = []
    try {
      const files = await fs.readdir(outputFolder)
      downloadedFiles = files.filter(f => f.endsWith('.mp3'))
    } catch {
      // Try single file
      const singleFile = path.join(OUTPUT_DIR, `${timestamp}.mp3`)
      try {
        await fs.access(singleFile)
        downloadedFiles = [`${timestamp}.mp3`]
      } catch {
        // Nothing downloaded
      }
    }

    if (downloadedFiles.length === 0) {
      return NextResponse.json({ 
        error: "Falha ao criar MP3.\n\n💡 Tente adicionar cookies.",
        needCookies: !cookieFilePath
      }, { status: 500 })
    }

    // Get video titles from stdout
    const titles = stdout.trim().split('\n').filter(t => t)
    
    if (isPlaylist) {
      return NextResponse.json({ 
        success: true, 
        isPlaylist: true,
        count: downloadedFiles.length,
        titles: titles,
        folderUrl: `/downloads/playlist_${timestamp}/`,
        files: downloadedFiles
      })
    } else {
      const videoTitle = titles[0] || `audio_${timestamp}`
      const fileName = `${videoTitle}.mp3`
      
      // Find the actual file
      const actualFile = downloadedFiles[0]
      
      return NextResponse.json({ 
        success: true, 
        isPlaylist: false,
        fileName: actualFile || fileName,
        downloadUrl: `/downloads/playlist_${timestamp}/${actualFile}` 
      })
    }

  } catch (error: unknown) {
    console.error("Conversion error:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json({ error: errorMessage.slice(0, 300) }, { status: 500 })
  }
}
