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
  AlertCircle,
  Info,
  Play,
  ArrowLeft,
  Music
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const windowsSteps = [
  { title: "Baixar o FFmpeg", description: "Acesse o site oficial", content: "1. Acesse: https://www.gyan.dev/ffmpeg/builds/\n2. Baixe 'ffmpeg-release-essentials.zip'" },
  { title: "Extrair os arquivos", description: "Descompacte em C:\\ffmpeg", content: "1. Extraia para C:\\ffmpeg\n2. Verifique: C:\\ffmpeg\\bin\\ffmpeg.exe" },
  { title: "Adicionar ao PATH", description: "Configure as variáveis de ambiente", content: "1. Win + R → sysdm.cpl\n2. Aba Avançado → Variáveis de Ambiente\n3. Edite 'Path' → Novo → C:\\ffmpeg\\bin" },
  { title: "Verificar instalação", description: "Teste no terminal", content: "Abra um NOVO terminal e execute:\nffmpeg -version" }
]

const linuxCommands = [
  { distro: "Ubuntu/Debian", command: "sudo apt update && sudo apt install ffmpeg -y" },
  { distro: "Fedora", command: "sudo dnf install ffmpeg -y" },
  { distro: "Arch Linux", command: "sudo pacman -S ffmpeg" }
]

const macSteps = [
  { title: "Instalar Homebrew", description: "Gerenciador de pacotes", content: "/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"" },
  { title: "Instalar FFmpeg", description: "Via Homebrew", content: "brew install ffmpeg" }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Conversor
            </Button>
          </Link>
        </motion.div>

        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <Download className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-500 bg-clip-text text-transparent">
              Como Instalar o FFmpeg
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Guia completo para instalar o FFmpeg e adicionar ao PATH
          </p>
        </motion.header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-10">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                O que é FFmpeg?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                <strong className="text-white">FFmpeg</strong> é uma ferramenta de linha de comando poderosa e gratuita 
                para processamento de áudio e vídeo. Ele é essencial para o funcionamento do conversor YouTube para MP3.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Windows */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Windows</CardTitle>
                    <CardDescription className="text-gray-400">Passo a passo para instalar e configurar o PATH</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {windowsSteps.map((step, index) => (
                    <Collapsible key={step.title} open={openSteps[step.title]} onOpenChange={() => toggleStep(step.title)}>
                      <Card className="bg-gray-800/30 border-gray-700/30 overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-base text-white">{step.title}</CardTitle>
                                  <CardDescription className="text-gray-400 text-sm">{step.description}</CardDescription>
                                </div>
                              </div>
                              <motion.div animate={{ rotate: openSteps[step.title] ? 180 : 0 }}>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 pb-4">
                            <pre className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 whitespace-pre-wrap font-mono text-xs">
                              {step.content}
                            </pre>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    onClick={() => window.open('https://www.gyan.dev/ffmpeg/builds/', '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Baixar FFmpeg para Windows
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Linux */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                    <Terminal className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Linux</CardTitle>
                    <CardDescription className="text-gray-400">Instalação via gerenciador de pacotes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4">
                  <p className="text-orange-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    O PATH é configurado automaticamente!
                  </p>
                </div>
                <div className="space-y-3">
                  {linuxCommands.map((item, index) => (
                    <div key={item.distro} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                          {item.distro}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(item.command, index)}>
                          {copiedIndex === index ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                        </Button>
                      </div>
                      <code className="text-xs text-orange-300 font-mono block p-2 bg-gray-900/50 rounded">
                        {item.command}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* macOS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">macOS</CardTitle>
                    <CardDescription className="text-gray-400">Instalação via Homebrew</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {macSteps.map((step, index) => (
                    <div key={step.title} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <span className="font-medium text-white text-sm">{step.title}</span>
                      </div>
                      <code className="text-xs text-gray-300 font-mono block p-2 bg-gray-900/50 rounded">
                        {step.content}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-10">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-500/20">
                    <Play className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Pronto para testar?</h3>
                    <p className="text-gray-400 text-sm">Execute <code className="px-2 py-0.5 bg-gray-800 rounded text-emerald-400">ffmpeg -version</code> no terminal</p>
                  </div>
                </div>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                    <Music className="w-4 h-4 mr-2" />
                    Voltar ao Conversor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
