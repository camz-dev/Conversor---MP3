"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Download,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Music,
  Monitor,
  Palette,
  Loader2,
  FileCode,
  Github,
  Youtube,
  Headphones
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"

// Python code content - full implementation
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

    AUTOR: Gerado automaticamente
    VERSÃO: 1.0.0
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
    """
    Classe principal do conversor de YouTube para MP3.
    Gerencia a interface gráfica e o processo de download/conversão.
    """
    
    def __init__(self, root):
        """Inicializa a aplicação com a janela principal."""
        self.root = root
        self.is_downloading = False
        
        # Configuração da janela
        self.setup_window()
        
        # Criação dos widgets
        self.create_widgets()
        
    def setup_window(self):
        """Configura as propriedades da janela principal."""
        self.root.title("🎵 Conversor YouTube para MP3")
        self.root.geometry("550x280")
        self.root.resizable(False, False)
        
        # Centralizar janela na tela
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        # Cores do tema escuro
        self.bg_color = "#1e1e1e"
        self.fg_color = "#ffffff"
        self.entry_bg = "#2d2d2d"
        self.button_bg = "#28a745"
        self.button_hover = "#218838"
        self.status_fg = "#888888"
        self.accent_color = "#ff6b6b"
        
        self.root.configure(bg=self.bg_color)
        
    def create_widgets(self):
        """Cria todos os widgets da interface."""
        
        # Frame principal
        main_frame = tk.Frame(self.root, bg=self.bg_color, padx=30, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Título
        title_label = tk.Label(
            main_frame,
            text="🎵 Conversor YouTube para MP3",
            font=("Segoe UI", 16, "bold"),
            bg=self.bg_color,
            fg=self.fg_color
        )
        title_label.pack(pady=(0, 20))
        
        # Label para URL
        url_label = tk.Label(
            main_frame,
            text="Cole a URL do YouTube:",
            font=("Segoe UI", 10),
            bg=self.bg_color,
            fg=self.fg_color
        )
        url_label.pack(anchor=tk.W)
        
        # Campo de entrada para URL
        self.url_entry = tk.Entry(
            main_frame,
            font=("Segoe UI", 10),
            bg=self.entry_bg,
            fg=self.fg_color,
            insertbackground=self.fg_color,
            relief=tk.FLAT,
            highlightthickness=1,
            highlightbackground="#444444",
            highlightcolor=self.button_bg
        )
        self.url_entry.pack(fill=tk.X, pady=(5, 15), ipady=8)
        self.url_entry.bind('<Return>', lambda e: self.iniciar_download())
        
        # Frame para botão
        button_frame = tk.Frame(main_frame, bg=self.bg_color)
        button_frame.pack(fill=tk.X, pady=10)
        
        # Botão de download
        self.download_btn = tk.Button(
            button_frame,
            text="⬇️ Baixar MP3",
            font=("Segoe UI", 11, "bold"),
            bg=self.button_bg,
            fg=self.fg_color,
            activebackground=self.button_hover,
            activeforeground=self.fg_color,
            relief=tk.FLAT,
            cursor="hand2",
            command=self.iniciar_download
        )
        self.download_btn.pack(fill=tk.X, ipady=10)
        
        # Efeitos de hover no botão
        self.download_btn.bind('<Enter>', self.on_button_hover)
        self.download_btn.bind('<Leave>', self.on_button_leave)
        
        # Área de status
        self.status_label = tk.Label(
            main_frame,
            text="Pronto para converter",
            font=("Segoe UI", 9),
            bg=self.bg_color,
            fg=self.status_fg
        )
        self.status_label.pack(pady=(15, 0))
        
        # Barra de progresso simples (label animado)
        self.progress_label = tk.Label(
            main_frame,
            text="",
            font=("Segoe UI", 9),
            bg=self.bg_color,
            fg=self.button_bg
        )
        self.progress_label.pack(pady=(5, 0))
        
    def on_button_hover(self, event):
        """Efeito hover no botão."""
        if not self.is_downloading:
            self.download_btn.configure(bg=self.button_hover)
            
    def on_button_leave(self, event):
        """Remove efeito hover do botão."""
        if not self.is_downloading:
            self.download_btn.configure(bg=self.button_bg)
            
    def atualizar_status(self, texto, cor=None):
        """
        Atualiza o texto de status na interface.
        
        Args:
            texto: Texto a ser exibido
            cor: Cor opcional para o texto (hex string)
        """
        self.status_label.configure(text=texto, fg=cor if cor else self.status_fg)
        self.root.update_idletasks()
        
    def atualizar_progresso(self, texto):
        """Atualiza o texto de progresso."""
        self.progress_label.configure(text=texto)
        self.root.update_idletasks()
        
    def validar_url_youtube(self, url):
        """
        Valida se a URL é uma URL válida do YouTube.
        
        Args:
            url: URL a ser validada
            
        Returns:
            bool: True se a URL é válida, False caso contrário
        """
        padroes = [
            r'^https?://(www\\.)?youtube\\.com/watch\\?v=[\\w-]+',
            r'^https?://(www\\.)?youtu\\.be/[\\w-]+',
            r'^https?://(www\\.)?youtube\\.com/shorts/[\\w-]+',
            r'^https?://(m\\.)?youtube\\.com/watch\\?v=[\\w-]+',
        ]
        
        for padrao in padroes:
            if re.match(padrao, url):
                return True
        return False
        
    def verificar_ffmpeg(self):
        """
        Verifica se o FFmpeg está instalado e disponível no PATH.
        
        Returns:
            bool: True se FFmpeg está disponível, False caso contrário
        """
        return shutil.which('ffmpeg') is not None
        
    def verificar_yt_dlp(self):
        """
        Verifica se o yt-dlp está instalado.
        
        Returns:
            bool: True se yt-dlp está disponível, False caso contrário
        """
        # Tenta encontrar yt-dlp como comando
        if shutil.which('yt-dlp'):
            return True
            
        # Tenta encontrar como módulo Python
        try:
            subprocess.run(
                ['python', '-m', 'yt_dlp', '--version'],
                capture_output=True,
                check=True
            )
            return True
        except:
            pass
            
        return False
        
    def iniciar_download(self):
        """Inicia o processo de download após validações."""
        if self.is_downloading:
            messagebox.showwarning("Aguarde", "Já existe um download em andamento.")
            return
            
        url = self.url_entry.get().strip()
        
        # Validação 1: URL vazia
        if not url:
            messagebox.showerror("Erro", "Por favor, insira uma URL do YouTube.")
            self.url_entry.focus_set()
            return
            
        # Validação 2: URL do YouTube
        if not self.validar_url_youtube(url):
            resposta = messagebox.askyesno(
                "URL Suspeita",
                "A URL não parece ser um link válido do YouTube.\\n\\n"
                "Deseja tentar mesmo assim?"
            )
            if not resposta:
                return
                
        # Validação 3: FFmpeg
        if not self.verificar_ffmpeg():
            messagebox.showerror(
                "FFmpeg não encontrado",
                "O FFmpeg não está instalado ou não está no PATH.\\n\\n"
                "Por favor, instale o FFmpeg:\\n"
                "• Windows: Baixe de ffmpeg.org e adicione ao PATH\\n"
                "• Linux: sudo apt install ffmpeg\\n"
                "• Mac: brew install ffmpeg"
            )
            return
            
        # Validação 4: yt-dlp
        if not self.verificar_yt_dlp():
            messagebox.showerror(
                "yt-dlp não encontrado",
                "O yt-dlp não está instalado.\\n\\n"
                "Instale com: pip install yt-dlp"
            )
            return
            
        # Selecionar pasta de destino
        pasta_destino = filedialog.askdirectory(
            title="Selecione a pasta para salvar o MP3"
        )
        
        if not pasta_destino:
            self.atualizar_status("Download cancelado pelo usuário")
            return
            
        # Inicia download em thread separada
        self.is_downloading = True
        self.download_btn.configure(
            text="⏳ Baixando...",
            bg="#666666",
            state=tk.DISABLED
        )
        
        thread = threading.Thread(
            target=self.thread_download,
            args=(url, pasta_destino),
            daemon=True
        )
        thread.start()
        
    def thread_download(self, url, pasta_destino):
        """
        Thread separada para executar o download sem travar a interface.
        
        Args:
            url: URL do vídeo do YouTube
            pasta_destino: Caminho da pasta onde o MP3 será salvo
        """
        try:
            self.atualizar_status("Iniciando download...", "#ffff00")
            self.atualizar_progresso("Conectando ao YouTube...")
            
            # Template de nome do arquivo
            template_saida = os.path.join(pasta_destino, "%(title)s.%(ext)s")
            
            # Comando yt-dlp para baixar e converter para MP3
            comando = [
                'yt-dlp',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '192K',
                '--no-playlist',
                '--no-warnings',
                '--restrict-filenames',
                '-o', template_saida,
                url
            ]
            
            # Executa o comando
            self.atualizar_status("Baixando áudio...", "#00ffff")
            self.atualizar_progresso("Aguarde, isso pode levar alguns minutos...")
            
            processo = subprocess.Popen(
                comando,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = processo.communicate()
            
            if processo.returncode == 0:
                # Sucesso - encontra o arquivo criado
                self.atualizar_status("Convertendo para MP3...", "#00ff00")
                self.atualizar_progresso("Quase lá...")
                
                # Procura o arquivo MP3 criado
                arquivos_mp3 = [
                    f for f in os.listdir(pasta_destino)
                    if f.endswith('.mp3')
                ]
                
                if arquivos_mp3:
                    # Pega o arquivo mais recente
                    arquivo_mais_recente = max(
                        [os.path.join(pasta_destino, f) for f in arquivos_mp3],
                        key=os.path.getctime
                    )
                    
                    self.atualizar_status("✅ Download concluído!", "#00ff00")
                    self.atualizar_progresso("")
                    
                    self.root.after(0, lambda: messagebox.showinfo(
                        "Sucesso!",
                        f"✅ Download concluído com sucesso!\\n\\n"
                        f"Arquivo salvo em:\\n{arquivo_mais_recente}"
                    ))
                else:
                    raise Exception("Arquivo MP3 não encontrado após conversão")
                    
            else:
                # Erro no download
                erro_msg = stderr if stderr else stdout
                raise Exception(f"Erro no yt-dlp: {erro_msg}")
                
        except subprocess.CalledProcessError as e:
            self.root.after(0, lambda: self.tratar_erro(
                f"Erro ao executar yt-dlp:\\n{str(e)}"
            ))
            
        except Exception as e:
            self.root.after(0, lambda: self.tratar_erro(str(e)))
            
        finally:
            # Restaura o estado do botão
            self.is_downloading = False
            self.root.after(0, self.restaurar_botao)
            
    def tratar_erro(self, mensagem):
        """
        Exibe mensagem de erro para o usuário.
        
        Args:
            mensagem: Mensagem de erro a ser exibida
        """
        self.atualizar_status("❌ Erro no download", self.accent_color)
        self.atualizar_progresso("")
        
        # Simplifica mensagens de erro comuns
        if "network" in mensagem.lower() or "connection" in mensagem.lower():
            mensagem = "Erro de conexão. Verifique sua internet e tente novamente."
        elif "private" in mensagem.lower():
            mensagem = "Este vídeo é privado e não pode ser baixado."
        elif "not available" in mensagem.lower() or "unavailable" in mensagem.lower():
            mensagem = "Vídeo não disponível. Pode ter sido removido ou está bloqueado."
        elif "sign in" in mensagem.lower():
            mensagem = "Este vídeo requer login e não pode ser baixado."
            
        messagebox.showerror("Erro no Download", f"❌ {mensagem}")
        
    def restaurar_botao(self):
        """Restaura o botão para o estado normal."""
        self.download_btn.configure(
            text="⬇️ Baixar MP3",
            bg=self.button_bg,
            state=tk.NORMAL
        )


def main():
    """Ponto de entrada da aplicação."""
    root = tk.Tk()
    app = YouTubeToMP3Converter(root)
    root.mainloop()


if __name__ == "__main__":
    main()`

const features = [
  {
    icon: Monitor,
    title: "Desktop App",
    description: "Interface gráfica com Tkinter para uso fácil e intuitivo"
  },
  {
    icon: Youtube,
    title: "YouTube para MP3",
    description: "Converte vídeos do YouTube em arquivos MP3 de alta qualidade"
  },
  {
    icon: Terminal,
    title: "yt-dlp + FFmpeg",
    description: "Tecnologias robustas para download e conversão de áudio"
  },
  {
    icon: Palette,
    title: "Dark Theme",
    description: "Interface moderna com tema escuro confortável para os olhos"
  },
  {
    icon: Loader2,
    title: "Progress Indicators",
    description: "Indicadores de progresso em tempo real durante o download"
  },
  {
    icon: Headphones,
    title: "Qualidade 192K",
    description: "Conversão em alta qualidade de 192kbps"
  }
]

const dependencies = [
  { name: "yt-dlp", command: "pip install yt-dlp", description: "Downloader do YouTube" },
  { name: "FFmpeg", command: "sudo apt install ffmpeg", description: "Conversor de áudio/vídeo" },
  { name: "Python 3.x", command: "python --version", description: "Interpretador Python" }
]

export default function Home() {
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    // Simulate download
    const link = document.createElement('a')
    link.href = '/youtube_to_mp3_converter.py'
    link.download = 'youtube_to_mp3_converter.py'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setIsDownloading(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25"
          >
            <Music className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
          >
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
              🎵 Conversor YouTube
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500 bg-clip-text text-transparent">
              para MP3
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Aplicação desktop Python com interface gráfica Tkinter para converter
            vídeos do YouTube em arquivos MP3 de alta qualidade
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
              Python 3.x
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">
              Tkinter GUI
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
              yt-dlp
            </Badge>
            <Badge variant="outline" className="border-pink-500/50 text-pink-400 bg-pink-500/10">
              FFmpeg
            </Badge>
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Features Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Funcionalidades
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Recursos do conversor de YouTube para MP3
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-gray-700/30"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20">
                        <feature.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Download Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-400" />
                  Download & Instalação
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Baixe o script e instale as dependências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Download Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Baixar Script Python
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Dependencies */}
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Dependências
                  </h4>
                  <div className="space-y-3">
                    {dependencies.map((dep, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{dep.name}</span>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {dep.description}
                          </Badge>
                        </div>
                        <code className="text-sm text-emerald-400 bg-gray-900/50 px-2 py-1 rounded block mt-2 font-mono">
                          {dep.command}
                        </code>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Start */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-emerald-500/20">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    Quick Start
                  </h4>
                  <code className="text-sm text-gray-300 block font-mono">
                    python youtube_to_mp3_converter.py
                  </code>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-12"
        >
          <Collapsible
            open={isCodeOpen}
            onOpenChange={setIsCodeOpen}
            className="w-full"
          >
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-xl overflow-hidden">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-purple-400" />
                        Visualizar Código
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Código fonte do conversor Python
                      </CardDescription>
                    </div>
                    <motion.div
                      animate={{ rotate: isCodeOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] w-full">
                    <SyntaxHighlighter
                      language="python"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        lineHeight: '1.6'
                      }}
                      showLineNumbers
                      lineNumberStyle={{
                        minWidth: '3em',
                        paddingRight: '1em',
                        color: '#4a5568',
                        textAlign: 'right'
                      }}
                    >
                      {pythonCode}
                    </SyntaxHighlighter>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 border-t border-gray-800/50"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Como Usar</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/30">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-400 font-bold">1</span>
                </div>
                <p className="text-gray-300">Instale as dependências necessárias</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/30">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <p className="text-gray-300">Execute o script Python</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/30">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <p className="text-gray-300">Cole a URL e baixe o MP3</p>
              </div>
            </div>
            <p className="mt-6 text-gray-500 text-sm">
              Desenvolvido com Python • Tkinter • yt-dlp • FFmpeg
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
