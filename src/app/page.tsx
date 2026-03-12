"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Youtube,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Music,
  Monitor,
  HelpCircle,
  AlertCircle,
  Cookie,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Status = "idle" | "downloading" | "converting" | "success" | "error"

export default function Home() {
  const [url, setUrl] = useState("")
  const [cookies, setCookies] = useState("")
  const [showCookiesHelp, setShowCookiesHelp] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [needCookies, setNeedCookies] = useState(false)
  const [copied, setCopied] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
    ]
    return patterns.some(p => p.test(url))
  }

  const handleConvert = async () => {
    if (!url.trim()) {
      setMessage("Por favor, insira uma URL do YouTube")
      setStatus("error")
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setMessage("URL inválida. Insira uma URL do YouTube válida")
      setStatus("error")
      return
    }

    setStatus("downloading")
    setProgress(10)
    setMessage("Conectando ao YouTube...")
    setNeedCookies(false)

    abortControllerRef.current = new AbortController()

    try {
      setProgress(20)
      setMessage("Obtendo informações do vídeo...")

      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, cookies: cookies.trim() || null }),
        signal: abortControllerRef.current.signal
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needCookies) {
          setNeedCookies(true)
          setMessage(data.error)
          setStatus("error")
          setProgress(0)
          return
        }
        throw new Error(data.error || "Erro ao processar o vídeo")
      }

      setProgress(100)
      setStatus("success")
      setMessage("Conversão concluída!")
      setDownloadUrl(data.downloadUrl)
      setFileName(data.fileName)

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        setStatus("idle")
        setMessage("Download cancelado")
        setProgress(0)
        return
      }
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Erro desconhecido")
      setProgress(0)
    }
  }

  const handleCancel = () => {
    abortControllerRef.current?.abort()
  }

  const handleReset = () => {
    setUrl("")
    setStatus("idle")
    setProgress(0)
    setMessage("")
    setDownloadUrl("")
    setFileName("")
    setNeedCookies(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getButtonContent = () => {
    switch (status) {
      case "downloading":
      case "converting":
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Cancelar
          </>
        )
      case "success":
        return (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Nova Conversão
          </>
        )
      case "error":
        return (
          <>
            <AlertCircle className="w-5 h-5 mr-2" />
            Tentar Novamente
          </>
        )
      default:
        return (
          <>
            <Download className="w-5 h-5 mr-2" />
            Converter para MP3
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Navigation */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              YouTube to MP3
            </span>
          </div>
          <div className="flex gap-2">
            <Link href="/desktop">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50">
                <Monitor className="w-4 h-4 mr-2" />
                Versão Desktop
              </Button>
            </Link>
            <Link href="/ffmpeg">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50">
                <HelpCircle className="w-4 h-4 mr-2" />
                Instalar FFmpeg
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-500/30">
            <Youtube className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
              Conversor YouTube
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500 bg-clip-text text-transparent">
              para MP3
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto">
            Converta vídeos do YouTube para MP3 diretamente no navegador
            <br />
            <span className="text-emerald-400 font-medium">Sem instalação • Rápido • Gratuito</span>
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
              ✨ Versão Web
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">
              🎵 192kbps
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
              ⚡ Conversão Rápida
            </Badge>
          </motion.div>
        </motion.header>

        {/* Main Converter Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mb-12">
          <Card className="bg-gray-900/70 border-gray-800/50 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Download className="w-6 h-6 text-emerald-400" />
                Converter Vídeo
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cole o link do YouTube e clique em converter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Input */}
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && status !== "downloading" && handleConvert()}
                  className="pl-12 h-14 text-lg bg-gray-800/50 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  disabled={status === "downloading"}
                />
              </div>

              {/* Cookies Section */}
              <Collapsible open={showCookiesHelp || needCookies} onOpenChange={setShowCookiesHelp}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50"
                  >
                    <span className="flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-amber-400" />
                      Cookies (opcional - para desbloquear)
                    </span>
                    {showCookiesHelp || needCookies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 space-y-3">
                    {/* Instructions */}
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                      <p className="font-medium text-amber-300 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Como obter cookies:
                      </p>
                      <ol className="text-gray-300 space-y-1 text-xs list-decimal list-inside">
                        <li>Instale a extensão <strong>"Get cookies.txt LOCALLY"</strong> no Chrome/Firefox</li>
                        <li>Acesse youtube.com e faça login na sua conta</li>
                        <li>Clique na extensão e em <strong>"Export"</strong></li>
                        <li>Cole o conteúdo aqui</li>
                      </ol>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-amber-400 p-0 h-auto mt-2 text-xs"
                        onClick={() => window.open('https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc', '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Baixar extensão para Chrome
                      </Button>
                    </div>
                    
                    {/* Cookie input */}
                    <Textarea
                      placeholder="Cole os cookies do YouTube aqui..."
                      value={cookies}
                      onChange={(e) => setCookies(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 focus:border-amber-500 min-h-[100px] font-mono text-xs"
                      disabled={status === "downloading"}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Progress Bar */}
              <AnimatePresence>
                {(status === "downloading" || status === "converting") && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{message}</span>
                        <span className="text-emerald-400">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-gray-800" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Messages */}
              <AnimatePresence>
                {status === "success" && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-emerald-300 font-medium">{message}</p>
                        <p className="text-sm text-gray-400">{fileName}</p>
                      </div>
                    </div>
                    <a href={downloadUrl} download className="mt-4 w-full">
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar MP3
                      </Button>
                    </a>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-400" />
                      <p className="text-red-300 text-sm whitespace-pre-line flex-1">{message}</p>
                    </div>
                    {needCookies && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => setShowCookiesHelp(true)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                        >
                          <Cookie className="w-4 h-4 mr-2" />
                          Adicionar Cookies
                        </Button>
                        <Link href="/desktop" className="flex-1">
                          <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                            <Monitor className="w-4 h-4 mr-2" />
                            Usar Desktop
                          </Button>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <Button
                onClick={status === "downloading" ? handleCancel : status === "success" || status === "error" ? handleReset : handleConvert}
                disabled={status === "converting"}
                className={`w-full h-14 text-lg font-semibold transition-all ${
                  status === "error" 
                    ? "bg-red-500 hover:bg-red-600" 
                    : status === "success"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                } shadow-lg shadow-emerald-500/25`}
              >
                {getButtonContent()}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "Super Rápido", desc: "Conversão em segundos" },
              { icon: "🎵", title: "Alta Qualidade", desc: "192kbps de áudio" },
              { icon: "🔒", title: "Seguro", desc: "Sem registro necessário" },
              { icon: "📱", title: "Responsivo", desc: "Funciona em qualquer dispositivo" },
              { icon: "♾️", title: "Ilimitado", desc: "Sem limite de conversões" },
              { icon: "🌐", title: "Online", desc: "Direto no navegador" },
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-900/40 border-gray-800/30 hover:border-emerald-500/30 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-medium text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Help Banners */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto space-y-4">
          
          {/* FFmpeg Help */}
          <Link href="/ffmpeg">
            <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-amber-500/30 hover:border-amber-500/50 transition-colors cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-500/20">
                      <HelpCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Precisa de ajuda para instalar o FFmpeg?</h3>
                      <p className="text-sm text-gray-400">Clique aqui para ver o guia completo de instalação</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Desktop Version */}
          <Link href="/desktop">
            <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Monitor className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Prefere uma versão desktop?</h3>
                      <p className="text-sm text-gray-400">Baixe o script Python para usar offline</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-center py-8 mt-12 border-t border-gray-800/50">
          <p className="text-gray-500 text-sm">
            Converta vídeos do YouTube para MP3 de forma rápida e gratuita
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Use apenas para conteúdo que você tem permissão para baixar
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
