#!/usr/bin/env python3
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
            r'^https?://(www\.)?youtube\.com/watch\?v=[\w-]+',
            r'^https?://(www\.)?youtu\.be/[\w-]+',
            r'^https?://(www\.)?youtube\.com/shorts/[\w-]+',
            r'^https?://(m\.)?youtube\.com/watch\?v=[\w-]+',
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
                "A URL não parece ser um link válido do YouTube.\n\n"
                "Deseja tentar mesmo assim?"
            )
            if not resposta:
                return
                
        # Validação 3: FFmpeg
        if not self.verificar_ffmpeg():
            messagebox.showerror(
                "FFmpeg não encontrado",
                "O FFmpeg não está instalado ou não está no PATH.\n\n"
                "Por favor, instale o FFmpeg:\n"
                "• Windows: Baixe de ffmpeg.org e adicione ao PATH\n"
                "• Linux: sudo apt install ffmpeg\n"
                "• Mac: brew install ffmpeg"
            )
            return
            
        # Validação 4: yt-dlp
        if not self.verificar_yt_dlp():
            messagebox.showerror(
                "yt-dlp não encontrado",
                "O yt-dlp não está instalado.\n\n"
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
                        f"✅ Download concluído com sucesso!\n\n"
                        f"Arquivo salvo em:\n{arquivo_mais_recente}"
                    ))
                else:
                    raise Exception("Arquivo MP3 não encontrado após conversão")
                    
            else:
                # Erro no download
                erro_msg = stderr if stderr else stdout
                raise Exception(f"Erro no yt-dlp: {erro_msg}")
                
        except subprocess.CalledProcessError as e:
            self.root.after(0, lambda: self.tratar_erro(
                f"Erro ao executar yt-dlp:\n{str(e)}"
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
    main()
