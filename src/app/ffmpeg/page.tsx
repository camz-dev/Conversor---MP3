"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Download,
  Terminal,
  CheckCircle2,
  ChevronDown,
  Monitor,
  Apple,
  Copy,
  Check,
  ExternalLink,
  Info,
  Play,
  ArrowLeft,
  Music,
  Youtube
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const windowsSteps = [
  {
    title: "1. Baixar FFmpeg",
    description: "Acesse o site oficial",
    content: `1. Acesse: https://www.gyan.dev/ffmpeg/builds/
2. Role para baixo até "Release Builds"
3. Baixe "ffmpeg-release-essentials.zip"`
  },
  {
    title: "2. Extrair arquivos",
    description: "Descompacte em uma pasta simples",
    content: `1. Clique com botão direito no arquivo .zip
2. Extrair tudo para: C:\\ffmpeg

Estrutura final:
C:\\ffmpeg\\bin\\ffmpeg.exe
C:\\ffmpeg\\bin\\ffprobe.exe`
  },
  {
    title: "3. Abrir variáveis de ambiente",
    description: "Configuração do Windows",
    content: `Método rápido:
1. Pressione Win + R
2. Digite: sysdm.cpl
3. Aba "Avançado"
4. Clique "Variáveis de Ambiente..."`
  },
  {
    title: "4. Adicionar ao PATH",
    description: "Finalizar configuração",
    content: `1. Em "Variáveis do sistema", encontre "Path"
2. Clique "Editar..."
3. Clique "Novo"
4. Digite: C:\\ffmpeg\\bin
5. OK em todas as janelas`
  },
  {
    title: "5. Verificar instalação",
    description: "Testar no terminal",
    content: `1. FECHE todos os terminais abertos
2. Abra um NOVO terminal (CMD ou PowerShell)
3. Digite: ffmpeg -version

Se aparecer a versão, está funcionando! ✅`
  }
]

const linuxCommands = [
  { distro: "Ubuntu/Debian", command: "sudo apt update && sudo apt install ffmpeg -y" },
  { distro: "Fedora", command: "sudo dnf install ffmpeg -y" },
  { distro: "Arch Linux", command: "sudo pacman -S ffmpeg" },
  { distro: "openSUSE", command: "sudo zypper install ffmpeg" }
]

const macSteps = [
  { title: "1. Instalar Homebrew", command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' },
  { title: "2. Instalar FFmpeg", command: "brew install ffmpeg" },
  { title: "3. Verificar", command: "ffmpeg -version" }
]

export default function FFmpegPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({})

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const toggleStep = (stepTitle: string) => {
    setOpenSteps(prev => ({ ...prev, [stepTitle]: !prev[stepTitle] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 flex gap-2">
          <Link href="/">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          </Link>
          <Link href="/desktop">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
              <Monitor className="w-4 h-4 mr-2" /> Versão Desktop
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Download className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Instalar FFmpeg
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Guia completo para instalar o FFmpeg e adicionar ao PATH
          </p>
        </motion.header>

        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mb-8">
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-300">O que é FFmpeg?</p>
                  <p className="text-sm text-gray-300 mt-1">
                    FFmpeg é uma ferramenta gratuita para processamento de áudio e vídeo. 
                    É essencial para converter os vídeos do YouTube em arquivos MP3.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Windows Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8">
          <Card className="bg-gray-900/60 border-gray-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Windows</CardTitle>
                  <CardDescription>Passo a passo completo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {windowsSteps.map((step) => (
                <Collapsible key={step.title} open={openSteps[step.title]} onOpenChange={() => toggleStep(step.title)}>
                  <Card className="bg-gray-800/30 border-gray-700/30">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-white">{step.title}</CardTitle>
                          <motion.div animate={{ rotate: openSteps[step.title] ? 180 : 0 }}>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-3">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-3 rounded">
                          {step.content}
                        </pre>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
              <Button onClick={() => window.open('https://www.gyan.dev/ffmpeg/builds/', '_blank')}
                className="w-full bg-blue-500 hover:bg-blue-600">
                <ExternalLink className="w-4 h-4 mr-2" /> Baixar FFmpeg para Windows
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Linux Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-8">
          <Card className="bg-gray-900/60 border-gray-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Linux</CardTitle>
                  <CardDescription>Um comando e pronto!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded bg-orange-500/10 border border-orange-500/30">
                <p className="text-orange-300 text-sm">✅ O PATH é configurado automaticamente!</p>
              </div>
              {linuxCommands.map((item, index) => (
                <div key={item.distro} className="p-3 rounded bg-gray-800/30 border border-gray-700/30">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="border-orange-500/50 text-orange-400">{item.distro}</Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(item.command, index)}>
                      {copiedIndex === index ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                    </Button>
                  </div>
                  <code className="text-xs text-gray-300 font-mono block p-2 bg-gray-900/50 rounded">{item.command}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* macOS Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto mb-8">
          <Card className="bg-gray-900/60 border-gray-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">macOS</CardTitle>
                  <CardDescription>Via Homebrew</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {macSteps.map((step, index) => (
                <div key={step.title} className="p-3 rounded bg-gray-800/30 border border-gray-700/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">{step.title}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(step.command, index + 10)}>
                      {copiedIndex === index + 10 ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                    </Button>
                  </div>
                  <code className="text-xs text-gray-300 font-mono block p-2 bg-gray-900/50 rounded">{step.command}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mb-8">
          <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-500/20">
                    <Play className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Pronto para testar?</p>
                    <p className="text-sm text-gray-400">Execute no terminal:</p>
                    <code className="text-emerald-400 font-mono">ffmpeg -version</code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/">
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      <Music className="w-4 h-4 mr-2" /> Usar Web
                    </Button>
                  </Link>
                  <Link href="/desktop">
                    <Button variant="outline" className="border-emerald-500 text-emerald-400">
                      <Youtube className="w-4 h-4 mr-2" /> Baixar Desktop
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 border-t border-gray-800/50">
          <p className="text-gray-500 text-sm">FFmpeg é software livre e gratuito</p>
        </motion.footer>
      </div>
    </div>
  )
}
