"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Download,
  Terminal,
  CheckCircle2,
  ChevronDown,
  Music,
  Monitor,
  Loader2,
  FileCode,
  Youtube,
  Headphones,
  ArrowRight,
  Globe
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
    CONVERSOR DE VÍDEOS DO YOUTUBE PARA MP3
================================================================================

    Aplicativo desktop simples para converter vídeos do YouTube em arquivos MP3.
    Desenvolvido com Python e Tkinter.

    DEPENDÊNCIAS NECESSÁRIAS:
    -------------------------
    1. Python 3.x instalado (https://www.python.org/downloads/)
    
    2. yt-dlp - Instale com o comando:
       pip install yt-dlp
       
    3. FFmpeg - Necessário para conversão de áudio:
       - Windows: Baixe de https://ffmpeg.org/download.html e adicione ao PATH
       - Linux: sudo apt install ffmpeg
       - Mac: brew install ffmpeg

    COMO EXECUTAR:
    --------------
    python youtube_to_mp3_converter.py
================================================================================
"""

import tkinter as tk
from tkinter import filedialog, messagebox
import subprocess
import threading
import os
import shutil
import re


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
        self.entry_bg = "#2d2d2d"
        self.button_bg = "#28a745"
        self.button_hover = "#218838"
        self.status_fg = "#888888"
        self.accent_color = "#ff6b6b"
        self.root.configure(bg=self.bg_color)
        
    def create_widgets(self):
        main_frame = tk.Frame(self.root, bg=self.bg_color, padx=30, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        title_label = tk.Label(main_frame, text="🎵 Conversor YouTube para MP3",
            font=("Segoe UI", 16, "bold"), bg=self.bg_color, fg=self.fg_color)
        title_label.pack(pady=(0, 20))
        
        url_label = tk.Label(main_frame, text="Cole a URL do YouTube:",
            font=("Segoe UI", 10), bg=self.bg_color, fg=self.fg_color)
        url_label.pack(anchor=tk.W)
        
        self.url_entry = tk.Entry(main_frame, font=("Segoe UI", 10),
            bg=self.entry_bg, fg=self.fg_color, insertbackground=self.fg_color,
            relief=tk.FLAT, highlightthickness=1, highlightbackground="#444444",
            highlightcolor=self.button_bg)
        self.url_entry.pack(fill=tk.X, pady=(5, 15), ipady=8)
        
        self.download_btn = tk.Button(main_frame, text="⬇️ Baixar MP3",
            font=("Segoe UI", 11, "bold"), bg=self.button_bg, fg=self.fg_color,
            activebackground=self.button_hover, relief=tk.FLAT, cursor="hand2",
            command=self.iniciar_download)
        self.download_btn.pack(fill=tk.X, ipady=10)
        
        self.status_label = tk.Label(main_frame, text="Pronto para converter",
            font=("Segoe UI", 9), bg=self.bg_color, fg=self.status_fg)
        self.status_label.pack(pady=(15, 0))


def main():
    root = tk.Tk()
    app = YouTubeToMP3Converter(root)
    root.mainloop()


if __name__ == "__main__":
    main()`

const features = [
  { icon: Monitor, title: "Desktop App", description: "Interface gráfica com Tkinter" },
  { icon: Youtube, title: "YouTube para MP3", description: "Converte vídeos em MP3 de alta qualidade" },
  { icon: Terminal, title: "yt-dlp + FFmpeg", description: "Tecnologias robustas para download" },
  { icon: Headphones, title: "Qualidade 192K", description: "Conversão em 192kbps" }
]

export default function DesktopPage() {
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 flex gap-2">
          <Link href="/">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50">
              <Globe className="w-4 h-4 mr-2" />
              Versão Web
            </Button>
          </Link>
          <Link href="/ffmpeg">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50">
              <Terminal className="w-4 h-4 mr-2" />
              Instalar FFmpeg
            </Button>
          </Link>
        </motion.div>

        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
            <Monitor className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500 bg-clip-text text-transparent">
              Versão Desktop
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Baixe o script Python para rodar localmente no seu computador
          </p>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <feature.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-pink-400" />
                Download & Instalação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleDownload} disabled={isDownloading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                {isDownloading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Baixando...</> : <><Download className="w-5 h-5 mr-2" />Baixar Script Python</>}
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Dependências
                </h4>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-gray-800/50 border border-gray-700/30">
                    <span className="text-xs text-gray-400">yt-dlp</span>
                    <code className="text-xs text-purple-300 block mt-1">pip install yt-dlp</code>
                  </div>
                  <div className="p-2 rounded bg-gray-800/50 border border-gray-700/30">
                    <span className="text-xs text-gray-400">FFmpeg</span>
                    <Link href="/ffmpeg" className="text-xs text-pink-300 block mt-1 hover:underline flex items-center gap-1">
                      Ver guia de instalação <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h4 className="font-medium text-white text-sm mb-1 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  Quick Start
                </h4>
                <code className="text-xs text-gray-300 block font-mono">python youtube_to_mp3_converter.py</code>
              </div>
            </CardContent>
          </Card>
        </div>

        <Collapsible open={isCodeOpen} onOpenChange={setIsCodeOpen} className="max-w-5xl mx-auto">
          <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-400" />
                    Visualizar Código
                  </CardTitle>
                  <motion.div animate={{ rotate: isCodeOpen ? 180 : 0 }}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <SyntaxHighlighter language="python" style={vscDarkPlus} showLineNumbers
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.75rem' }}>
                    {pythonCode}
                  </SyntaxHighlighter>
                </ScrollArea>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  )
}
