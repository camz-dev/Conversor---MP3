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
  Loader2,
  FileCode,
  Globe,
  HelpCircle,
  ArrowRight
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CONVERSOR DE VÍDEOS DO YOUTUBE PARA MP3

DEPENDÊNCIAS:
1. pip install yt-dlp
2. FFmpeg instalado

EXECUTAR:
python youtube_to_mp3_converter.py
"""

import tkinter as tk
from tkinter import filedialog, messagebox
import subprocess, threading, os, shutil, re

class YouTubeToMP3Converter:
    def __init__(self, root):
        self.root = root
        self.is_downloading = False
        self.setup_window()
        self.create_widgets()
        
    def setup_window(self):
        self.root.title("🎵 Conversor YouTube para MP3")
        self.root.geometry("550x280")
        self.root.resizable(False, False)
        self.bg_color = "#1e1e1e"
        self.fg_color = "#ffffff"
        self.button_bg = "#28a745"
        self.root.configure(bg=self.bg_color)
        
    def create_widgets(self):
        main_frame = tk.Frame(self.root, bg=self.bg_color, padx=30, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(main_frame, text="🎵 Conversor YouTube para MP3",
            font=("Segoe UI", 16, "bold"), bg=self.bg_color, fg=self.fg_color).pack(pady=(0, 20))
        
        tk.Label(main_frame, text="Cole a URL do YouTube:",
            font=("Segoe UI", 10), bg=self.bg_color, fg=self.fg_color).pack(anchor=tk.W)
        
        self.url_entry = tk.Entry(main_frame, font=("Segoe UI", 10),
            bg="#2d2d2d", fg=self.fg_color, relief=tk.FLAT)
        self.url_entry.pack(fill=tk.X, pady=(5, 15), ipady=8)
        
        self.download_btn = tk.Button(main_frame, text="⬇️ Baixar MP3",
            font=("Segoe UI", 11, "bold"), bg=self.button_bg, fg=self.fg_color,
            relief=tk.FLAT, cursor="hand2")
        self.download_btn.pack(fill=tk.X, ipady=10)

def main():
    root = tk.Tk()
    app = YouTubeToMP3Converter(root)
    root.mainloop()

if __name__ == "__main__":
    main()`

const dependencies = [
  { name: "yt-dlp", command: "pip install yt-dlp", description: "Download do YouTube" },
  { name: "FFmpeg", command: "Veja o guia →", description: "Conversor de áudio", link: "/ffmpeg" },
  { name: "Python 3.x", command: "python --version", description: "Interpretador" }
]

const features = [
  { icon: Monitor, title: "Desktop App", description: "Interface gráfica Tkinter" },
  { icon: Terminal, title: "yt-dlp + FFmpeg", description: "Download e conversão" },
  { icon: Globe, title: "YouTube Music", description: "Playlists suportadas" }
]

export default function DesktopPage() {
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = '/youtube_to_mp3_converter.py'
    link.download = 'youtube_to_mp3_converter.py'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setIsDownloading(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 flex gap-2">
          <Link href="/">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
              <Globe className="w-4 h-4 mr-2" /> Versão Web
            </Button>
          </Link>
          <Link href="/ffmpeg">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
              <HelpCircle className="w-4 h-4 mr-2" /> Instalar FFmpeg
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Monitor className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Versão Desktop
          </h1>
          <p className="text-gray-400">YouTube e YouTube Music • Playlists e Vídeos</p>
        </motion.header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          {/* Download Card */}
          <Card className="bg-gray-900/60 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-400" />
                Download
              </CardTitle>
              <CardDescription className="text-gray-400">Baixe o script Python</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleDownload} disabled={isDownloading}
                className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg">
                {isDownloading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Baixando...</> : <><Download className="w-5 h-5 mr-2" />Baixar Script Python</>}
              </Button>
              
              {/* Dependencies */}
              <div className="space-y-2">
                <h4 className="font-medium text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" /> Dependências
                </h4>
                {dependencies.map((dep, i) => (
                  <div key={i} className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{dep.name}</span>
                      <span className="text-xs text-gray-400">{dep.description}</span>
                    </div>
                    {dep.link ? (
                      <Link href={dep.link} className="text-sm text-purple-400 hover:underline flex items-center gap-1 mt-1">
                        {dep.command} <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <code className="text-xs text-gray-300 block mt-1 font-mono">{dep.command}</code>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="bg-gray-900/60 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Vantagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "✅ Funciona 100% sem bloqueios",
                  "✅ Download rápido e estável",
                  "✅ Interface gráfica fácil",
                  "✅ Suporta YouTube Music!",
                  "✅ Baixe playlists inteiras",
                  "✅ Qualidade 192kbps MP3"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-gray-800/30">
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Preview */}
        <Collapsible open={isCodeOpen} onOpenChange={setIsCodeOpen} className="max-w-4xl mx-auto mb-10">
          <Card className="bg-gray-900/60 border-gray-800/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-400" /> Visualizar Código
                  </CardTitle>
                  <motion.div animate={{ rotate: isCodeOpen ? 180 : 0 }}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <SyntaxHighlighter language="python" style={vscDarkPlus} showLineNumbers
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.75rem' }}>
                    {pythonCode}
                  </SyntaxHighlighter>
                </ScrollArea>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 border-t border-gray-800/50">
          <p className="text-gray-500 text-sm">Python • Tkinter • yt-dlp • FFmpeg • YouTube Music</p>
        </motion.footer>
      </div>
    </div>
  )
}
