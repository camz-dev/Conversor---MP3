#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
    CONVERSOR DE VÍDEOS DO YOUTUBE PARA MP3
================================================================================

    Aplicativo desktop para converter vídeos e playlists do YouTube em MP3.
    Desenvolvido com Python e Tkinter.

    SUPORTA:
    --------
    • YouTube (youtube.com, youtu.be)
    • YouTube Music (music.youtube.com)
    • Vídeos individuais e playlists

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

    FUNCIONALIDADES:
    ----------------
    - Converter vídeos individuais para MP3
    - Baixar playlists inteiras do YouTube e YouTube Music
    - Visualizar músicas baixadas em tempo real
    - Progresso detalhado de cada música na playlist
    - Escolher pasta de destino
    - Barra de progresso em tempo real
    - Tratamento de erros

    AUTOR: Gerado automaticamente
    VERSÃO: 3.2.0
================================================================================
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk, scrolledtext
import subprocess
import threading
import os
import shutil
import re
import sys
import json
import time


class YouTubeToMP3Converter:
    """
    Classe principal do conversor de YouTube para MP3.
    Gerencia a interface gráfica e o processo de download/conversão.
    """
    
    def __init__(self, root):
        """Inicializa a aplicação com a janela principal."""
        self.root = root
        self.is_downloading = False
        self.is_playlist = False
        self.downloaded_songs = []  # Lista de músicas baixadas
        self.total_playlist_items = 0
        self.current_item = 0
        self.url_type = "youtube"  # "youtube" ou "youtube_music"
        
        # Configuração da janela
        self.setup_window()
        
        # Criação dos widgets
        self.create_widgets()
        
    def setup_window(self):
        """Configura as propriedades da janela principal."""
        self.root.title("🎵 Conversor YouTube / YouTube Music para MP3")
        self.root.geometry("700x650")
        self.root.resizable(True, True)
        self.root.minsize(600, 550)
        
        # Centralizar janela na tela
        self.root.update_idletasks()
        width = 700
        height = 650
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        # Cores do tema escuro
        self.bg_color = "#1e1e1e"
        self.fg_color = "#ffffff"
        self.entry_bg = "#2d2d2d"
        self.button_bg = "#28a745"
        self.button_hover = "#218838"
        self.button_playlist_bg = "#9b59b6"
        self.button_playlist_hover = "#8e44ad"
        self.button_music_bg = "#e91e63"
        self.button_music_hover = "#c2185b"
        self.status_fg = "#888888"
        self.accent_color = "#ff6b6b"
        self.list_bg = "#252525"
        self.success_color = "#28a745"
        self.downloading_color = "#ffc107"
        self.music_color = "#e91e63"
        
        self.root.configure(bg=self.bg_color)
        
    def create_widgets(self):
        """Cria todos os widgets da interface."""
        
        # Frame principal
        main_frame = tk.Frame(self.root, bg=self.bg_color, padx=20, pady=15)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Título
        title_label = tk.Label(
            main_frame,
            text="🎵 Conversor YouTube / YouTube Music",
            font=("Segoe UI", 18, "bold"),
            bg=self.bg_color,
            fg=self.fg_color
        )
        title_label.pack(pady=(0, 5))
        
        # Subtítulo
        subtitle_label = tk.Label(
            main_frame,
            text="Vídeos e Playlists - Visualização em Tempo Real",
            font=("Segoe UI", 10),
            bg=self.bg_color,
            fg=self.status_fg
        )
        subtitle_label.pack(pady=(0, 10))
        
        # Frame para entrada
        input_frame = tk.Frame(main_frame, bg=self.bg_color)
        input_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Label para URL
        url_label = tk.Label(
            input_frame,
            text="Cole a URL do YouTube, YouTube Music (vídeo ou playlist):",
            font=("Segoe UI", 10),
            bg=self.bg_color,
            fg=self.fg_color
        )
        url_label.pack(anchor=tk.W)
        
        # Campo de entrada para URL
        self.url_entry = tk.Entry(
            input_frame,
            font=("Segoe UI", 10),
            bg=self.entry_bg,
            fg=self.fg_color,
            insertbackground=self.fg_color,
            relief=tk.FLAT,
            highlightthickness=1,
            highlightbackground="#444444",
            highlightcolor=self.button_bg
        )
        self.url_entry.pack(fill=tk.X, pady=(5, 5), ipady=8)
        self.url_entry.bind('<Return>', lambda e: self.iniciar_download())
        self.url_entry.bind('<KeyRelease>', self.detectar_tipo_url)
        
        # Label de tipo detectado
        self.type_label = tk.Label(
            input_frame,
            text="",
            font=("Segoe UI", 9),
            bg=self.bg_color,
            fg=self.status_fg
        )
        self.type_label.pack(anchor=tk.W, pady=(2, 5))
        
        # Frame para botões de modo
        mode_frame = tk.Frame(main_frame, bg=self.bg_color)
        mode_frame.pack(fill=tk.X, pady=5)
        
        # Variável para o modo
        self.mode_var = tk.StringVar(value="video")
        
        # Radio button - Vídeo único
        self.radio_video = tk.Radiobutton(
            mode_frame,
            text="🎬 Vídeo Único",
            variable=self.mode_var,
            value="video",
            font=("Segoe UI", 10),
            bg=self.bg_color,
            fg=self.fg_color,
            selectcolor=self.entry_bg,
            activebackground=self.bg_color,
            activeforeground=self.fg_color,
            command=self.alterar_modo
        )
        self.radio_video.pack(side=tk.LEFT, padx=10)
        
        # Radio button - Playlist
        self.radio_playlist = tk.Radiobutton(
            mode_frame,
            text="📋 Playlist Inteira",
            variable=self.mode_var,
            value="playlist",
            font=("Segoe UI", 10),
            bg=self.bg_color,
            fg=self.fg_color,
            selectcolor=self.entry_bg,
            activebackground=self.bg_color,
            activeforeground=self.fg_color,
            command=self.alterar_modo
        )
        self.radio_playlist.pack(side=tk.LEFT, padx=10)
        
        # Frame para botões
        button_frame = tk.Frame(main_frame, bg=self.bg_color)
        button_frame.pack(fill=tk.X, pady=10)
        
        # Botão de download - Vídeo
        self.download_btn = tk.Button(
            button_frame,
            text="⬇️ Baixar MP3",
            font=("Segoe UI", 12, "bold"),
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
        
        # Frame de progresso da playlist
        playlist_frame = tk.Frame(main_frame, bg=self.bg_color)
        playlist_frame.pack(fill=tk.X, pady=5)
        
        # Label de status geral
        self.status_label = tk.Label(
            playlist_frame,
            text="Pronto para converter",
            font=("Segoe UI", 9),
            bg=self.bg_color,
            fg=self.status_fg
        )
        self.status_label.pack(anchor=tk.W)
        
        # Barra de progresso
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            playlist_frame,
            variable=self.progress_var,
            maximum=100,
            mode='determinate'
        )
        self.progress_bar.pack(fill=tk.X, pady=5)
        
        # Label de progresso detalhado
        self.progress_label = tk.Label(
            playlist_frame,
            text="",
            font=("Segoe UI", 9),
            bg=self.bg_color,
            fg=self.button_bg
        )
        self.progress_label.pack(anchor=tk.W)
        
        # === ÁREA DE MÚSICAS BAIXADAS ===
        songs_frame = tk.LabelFrame(
            main_frame,
            text="📋 Músicas Baixadas",
            font=("Segoe UI", 10, "bold"),
            bg=self.bg_color,
            fg=self.fg_color,
            padx=10,
            pady=10
        )
        songs_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Contador de músicas
        self.count_label = tk.Label(
            songs_frame,
            text="Total: 0 músicas",
            font=("Segoe UI", 9),
            bg=self.bg_color,
            fg=self.status_fg
        )
        self.count_label.pack(anchor=tk.W, pady=(0, 5))
        
        # Frame para a lista com scrollbar
        list_frame = tk.Frame(songs_frame, bg=self.bg_color)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        # Scrollbar
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Lista de músicas com Scrollbar
        self.songs_listbox = tk.Listbox(
            list_frame,
            font=("Segoe UI", 9),
            bg=self.list_bg,
            fg=self.fg_color,
            selectbackground="#3d3d3d",
            selectforeground=self.fg_color,
            relief=tk.FLAT,
            highlightthickness=1,
            highlightbackground="#444444",
            highlightcolor=self.button_bg,
            yscrollcommand=scrollbar.set,
            activestyle='none'
        )
        self.songs_listbox.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.songs_listbox.yview)
        
        # Frame para botões de ação
        action_frame = tk.Frame(main_frame, bg=self.bg_color)
        action_frame.pack(fill=tk.X, pady=(5, 0))
        
        # Botão para limpar lista
        self.clear_btn = tk.Button(
            action_frame,
            text="🗑️ Limpar Lista",
            font=("Segoe UI", 9),
            bg="#dc3545",
            fg=self.fg_color,
            activebackground="#c82333",
            activeforeground=self.fg_color,
            relief=tk.FLAT,
            cursor="hand2",
            command=self.limpar_lista
        )
        self.clear_btn.pack(side=tk.LEFT, padx=5)
        
        # Botão para abrir pasta
        self.open_folder_btn = tk.Button(
            action_frame,
            text="📁 Abrir Pasta",
            font=("Segoe UI", 9),
            bg="#17a2b8",
            fg=self.fg_color,
            activebackground="#138496",
            activeforeground=self.fg_color,
            relief=tk.FLAT,
            cursor="hand2",
            command=self.abrir_pasta
        )
        self.open_folder_btn.pack(side=tk.LEFT, padx=5)
        
        self.last_folder = None
        
    def detectar_tipo_url(self, event=None):
        """Detecta automaticamente o tipo de URL e se é playlist."""
        url = self.url_entry.get().strip()
        
        # Detectar YouTube Music
        if "music.youtube.com" in url:
            self.url_type = "youtube_music"
            
            # Detectar playlist do YouTube Music
            if "playlist?list=" in url or "/browse/VL" in url or ("list=" in url):
                self.mode_var.set("playlist")
                self.type_label.configure(
                    text="🎵 YouTube Music - Playlist detectada!",
                    fg=self.music_color
                )
            else:
                self.mode_var.set("video")
                self.type_label.configure(
                    text="🎵 YouTube Music - Vídeo detectado",
                    fg=self.music_color
                )
                
        # Detectar YouTube normal
        elif "youtube.com" in url or "youtu.be" in url:
            self.url_type = "youtube"
            
            # Detectar playlist do YouTube
            if "playlist?list=" in url or ("list=" in url and "watch" not in url):
                self.mode_var.set("playlist")
                self.type_label.configure(
                    text="📺 YouTube - Playlist detectada!",
                    fg=self.button_bg
                )
            else:
                self.mode_var.set("video")
                self.type_label.configure(
                    text="📺 YouTube - Vídeo detectado",
                    fg=self.button_bg
                )
        else:
            self.url_type = "youtube"
            self.type_label.configure(text="", fg=self.status_fg)
            
        self.alterar_modo()
            
    def alterar_modo(self):
        """Altera a aparência do botão baseado no modo selecionado."""
        if self.mode_var.get() == "playlist":
            if self.url_type == "youtube_music":
                # Playlist do YouTube Music - rosa
                self.download_btn.configure(
                    text="🎵 Baixar Playlist YouTube Music",
                    bg=self.button_music_bg
                )
                self.button_current_bg = self.button_music_bg
                self.button_current_hover = self.button_music_hover
            else:
                # Playlist do YouTube - roxo
                self.download_btn.configure(
                    text="📋 Baixar Playlist Inteira",
                    bg=self.button_playlist_bg
                )
                self.button_current_bg = self.button_playlist_bg
                self.button_current_hover = self.button_playlist_hover
        else:
            if self.url_type == "youtube_music":
                # Vídeo do YouTube Music - rosa
                self.download_btn.configure(
                    text="🎵 Baixar do YouTube Music",
                    bg=self.button_music_bg
                )
                self.button_current_bg = self.button_music_bg
                self.button_current_hover = self.button_music_hover
            else:
                # Vídeo do YouTube - verde
                self.download_btn.configure(
                    text="⬇️ Baixar MP3",
                    bg=self.button_bg
                )
                self.button_current_bg = self.button_bg
                self.button_current_hover = self.button_hover
            
    def on_button_hover(self, event):
        """Efeito hover no botão."""
        if not self.is_downloading:
            self.download_btn.configure(bg=self.button_current_hover if hasattr(self, 'button_current_hover') else self.button_hover)
            
    def on_button_leave(self, event):
        """Remove efeito hover do botão."""
        if not self.is_downloading:
            self.download_btn.configure(bg=self.button_current_bg if hasattr(self, 'button_current_bg') else self.button_bg)
            
    def atualizar_status(self, texto, cor=None):
        """Atualiza o texto de status na interface."""
        self.status_label.configure(text=texto, fg=cor if cor else self.status_fg)
        self.root.update_idletasks()
        
    def atualizar_progresso(self, valor, texto=""):
        """Atualiza a barra de progresso."""
        self.progress_var.set(valor)
        self.progress_label.configure(text=texto)
        self.root.update_idletasks()
        
    def adicionar_musica_lista(self, titulo, status="✅"):
        """Adiciona uma música à lista de músicas baixadas."""
        self.downloaded_songs.append(titulo)
        
        # Adicionar à listbox
        item_text = f"{status} {titulo}"
        self.songs_listbox.insert(tk.END, item_text)
        
        # Colorir baseado no status
        if status == "✅":
            self.songs_listbox.itemconfig(tk.END, fg=self.success_color)
        elif status == "⏳":
            self.songs_listbox.itemconfig(tk.END, fg=self.downloading_color)
        elif status == "❌":
            self.songs_listbox.itemconfig(tk.END, fg=self.accent_color)
            
        # Scroll automático para o último item
        self.songs_listbox.see(tk.END)
        
        # Atualizar contador
        self.count_label.configure(text=f"Total: {len(self.downloaded_songs)} músicas")
        self.root.update_idletasks()
        
    def atualizar_ultimo_item(self, novo_status):
        """Atualiza o status do último item da lista."""
        if self.downloaded_songs:
            ultimo_idx = self.songs_listbox.size() - 1
            titulo = self.downloaded_songs[-1]
            novo_texto = f"{novo_status} {titulo}"
            self.songs_listbox.delete(ultimo_idx)
            self.songs_listbox.insert(ultimo_idx, novo_texto)
            if novo_status == "✅":
                self.songs_listbox.itemconfig(ultimo_idx, fg=self.success_color)
            elif novo_status == "❌":
                self.songs_listbox.itemconfig(ultimo_idx, fg=self.accent_color)
            self.songs_listbox.see(tk.END)
            self.root.update_idletasks()
            
    def limpar_lista(self):
        """Limpa a lista de músicas baixadas."""
        self.downloaded_songs = []
        self.songs_listbox.delete(0, tk.END)
        self.count_label.configure(text="Total: 0 músicas")
        
    def abrir_pasta(self):
        """Abre a pasta do último download."""
        if self.last_folder and os.path.exists(self.last_folder):
            if sys.platform == 'win32':
                os.startfile(self.last_folder)
            elif sys.platform == 'darwin':
                subprocess.run(['open', self.last_folder])
            else:
                subprocess.run(['xdg-open', self.last_folder])
        else:
            messagebox.showinfo("Informação", "Nenhuma pasta de download disponível.")
        
    def validar_url_youtube(self, url):
        """Valida se a URL é uma URL válida do YouTube ou YouTube Music."""
        padroes = [
            # YouTube normal
            r'^https?://(www\.)?youtube\.com/watch\?v=[\w-]+',
            r'^https?://(www\.)?youtu\.be/[\w-]+',
            r'^https?://(www\.)?youtube\.com/shorts/[\w-]+',
            r'^https?://(m\.)?youtube\.com/watch\?v=[\w-]+',
            r'^https?://(www\.)?youtube\.com/playlist\?list=[\w-]+',
            # YouTube Music
            r'^https?://music\.youtube\.com/watch\?v=[\w-]+',
            r'^https?://music\.youtube\.com/playlist\?list=[\w-]+',
            r'^https?://music\.youtube\.com/browse/[\w-]+',
            r'^https?://music\.youtube\.com/[\w\?\=\&]+',
        ]
        
        for padrao in padroes:
            if re.match(padrao, url):
                return True
        return False
        
    def verificar_ffmpeg(self):
        """Verifica se o FFmpeg está instalado e disponível no PATH."""
        return shutil.which('ffmpeg') is not None
        
    def verificar_yt_dlp(self):
        """Verifica se o yt-dlp está instalado."""
        if shutil.which('yt-dlp'):
            return True
            
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
        self.is_playlist = self.mode_var.get() == "playlist"
        
        # Validação 1: URL vazia
        if not url:
            messagebox.showerror("Erro", "Por favor, insira uma URL do YouTube ou YouTube Music.")
            self.url_entry.focus_set()
            return
            
        # Validação 2: URL do YouTube
        if not self.validar_url_youtube(url):
            resposta = messagebox.askyesno(
                "URL Suspeita",
                "A URL não parece ser um link válido do YouTube ou YouTube Music.\n\n"
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
            title="Selecione a pasta para salvar os arquivos MP3"
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
        self.progress_var.set(0)
        self.total_playlist_items = 0
        self.current_item = 0
        
        thread = threading.Thread(
            target=self.thread_download,
            args=(url, pasta_destino),
            daemon=True
        )
        thread.start()
        
    def obter_videos_playlist(self, url):
        """Obtém a lista de vídeos da playlist com ID e título."""
        try:
            comando = [
                'yt-dlp',
                '--flat-playlist',
                '--dump-json',
                '--no-warnings',
                url
            ]
            
            resultado = subprocess.run(
                comando,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if resultado.returncode == 0:
                videos = []
                for line in resultado.stdout.strip().split('\n'):
                    if line.strip():
                        try:
                            data = json.loads(line)
                            videos.append({
                                'id': data.get('id', ''),
                                'title': data.get('title', 'Título desconhecido'),
                                'url': f"https://www.youtube.com/watch?v={data.get('id', '')}"
                            })
                        except json.JSONDecodeError:
                            continue
                return videos
        except Exception as e:
            print(f"Erro ao obter playlist: {e}")
        return []
        
    def thread_download(self, url, pasta_destino):
        """Thread separada para executar o download sem travar a interface."""
        try:
            source_name = "YouTube Music" if self.url_type == "youtube_music" else "YouTube"
            self.atualizar_status(f"Analisando URL ({source_name})...", "#ffff00")
            self.atualizar_progresso(5, f"Conectando ao {source_name}...")
            
            # Template de nome do arquivo
            if self.is_playlist:
                # Obter lista de vídeos da playlist
                self.atualizar_status(f"Obtendo informações da playlist ({source_name})...", "#ffff00")
                self.atualizar_progresso(10, "Analisando músicas da playlist...")
                
                videos = self.obter_videos_playlist(url)
                self.total_playlist_items = len(videos)
                
                if self.total_playlist_items > 0:
                    self.atualizar_status(f"Playlist: {self.total_playlist_items} músicas encontradas", "#00ffff")
                    self.atualizar_progresso(15, f"Preparando download de {self.total_playlist_items} músicas...")
                else:
                    self.atualizar_status("Nenhuma música encontrada na playlist", self.accent_color)
                    raise Exception("Não foi possível obter as músicas da playlist")
                
                # Para playlists, criar subpasta e numerar arquivos
                if self.url_type == "youtube_music":
                    playlist_folder = os.path.join(pasta_destino, "youtube_music_playlist")
                else:
                    playlist_folder = os.path.join(pasta_destino, "playlist_mp3")
                os.makedirs(playlist_folder, exist_ok=True)
                self.last_folder = playlist_folder
                
                # Baixar cada vídeo individualmente
                sucessos = 0
                erros = 0
                
                for i, video in enumerate(videos, 1):
                    if not self.is_downloading:
                        self.atualizar_status("Download cancelado", self.accent_color)
                        break
                        
                    self.current_item = i
                    titulo = video['title'][:50]
                    video_url = video['url']
                    
                    # Mostrar música sendo baixada
                    self.adicionar_musica_lista(video['title'][:60], "⏳")
                    
                    # Calcular progresso
                    progress_base = 15
                    progress_range = 80
                    total_progress = progress_base + ((i / self.total_playlist_items) * progress_range)
                    
                    status_text = f"Baixando {i}/{self.total_playlist_items}: {titulo}..."
                    self.atualizar_progresso(total_progress, status_text)
                    self.atualizar_status(
                        f"{source_name}: {i}/{self.total_playlist_items} músicas",
                        "#00ffff"
                    )
                    
                    # Template de saída com índice
                    template_saida = os.path.join(playlist_folder, f"{i:02d} - %(title)s.%(ext)s")
                    
                    # Comando para baixar vídeo individual
                    comando = [
                        'yt-dlp',
                        '--extract-audio',
                        '--audio-format', 'mp3',
                        '--audio-quality', '192K',
                        '--no-warnings',
                        '--restrict-filenames',
                        '-o', template_saida,
                        '--no-playlist',
                        video_url
                    ]
                    
                    try:
                        resultado = subprocess.run(
                            comando,
                            capture_output=True,
                            text=True,
                            timeout=300  # 5 minutos por música
                        )
                        
                        if resultado.returncode == 0:
                            # Sucesso - atualizar status
                            self.atualizar_ultimo_item("✅")
                            sucessos += 1
                        else:
                            # Erro no download
                            self.atualizar_ultimo_item("❌")
                            erros += 1
                            print(f"Erro ao baixar {titulo}: {resultado.stderr[:200]}")
                            
                    except subprocess.TimeoutExpired:
                        self.atualizar_ultimo_item("❌")
                        erros += 1
                        print(f"Timeout ao baixar {titulo}")
                    except Exception as e:
                        self.atualizar_ultimo_item("❌")
                        erros += 1
                        print(f"Erro ao baixar {titulo}: {e}")
                
                # Finalizar
                self.atualizar_progresso(100, "Concluído!")
                
                # Contar arquivos baixados
                arquivos = [f for f in os.listdir(playlist_folder) if f.endswith('.mp3')]
                quantidade = len(arquivos)
                
                if quantidade > 0:
                    self.atualizar_status(f"✅ Download concluído! {quantidade} música(s) salva(s)", "#00ff00")
                    self.root.after(0, lambda: messagebox.showinfo(
                        "Sucesso!",
                        f"✅ Playlist do {source_name} baixada!\n\n"
                        f"📁 {quantidade} arquivos salvos em:\n{playlist_folder}\n\n"
                        f"✅ Sucessos: {sucessos}\n❌ Erros: {erros}"
                    ))
                else:
                    self.atualizar_status("❌ Nenhum arquivo foi salvo", self.accent_color)
                    self.root.after(0, lambda: messagebox.showerror(
                        "Erro",
                        f"❌ Não foi possível baixar as músicas.\n\n"
                        f"Tente novamente ou verifique sua conexão."
                    ))
                    
            else:
                # Download de vídeo único
                self.total_playlist_items = 1
                self.atualizar_status(f"Vídeo detectado ({source_name})", "#00ffff")
                self.atualizar_progresso(15, "Preparando download...")
                
                template_saida = os.path.join(pasta_destino, "%(title)s.%(ext)s")
                self.last_folder = pasta_destino
                
                # Adicionar à lista
                self.adicionar_musica_lista("Baixando vídeo...", "⏳")
                
                # Comando yt-dlp para baixar
                comando = [
                    'yt-dlp',
                    '--extract-audio',
                    '--audio-format', 'mp3',
                    '--audio-quality', '192K',
                    '--no-warnings',
                    '--restrict-filenames',
                    '-o', template_saida,
                    '--no-playlist',
                    url
                ]
                
                self.atualizar_progresso(50, "Baixando e convertendo...")
                
                resultado = subprocess.run(
                    comando,
                    capture_output=True,
                    text=True,
                    timeout=600
                )
                
                if resultado.returncode == 0:
                    # Procura o arquivo MP3 criado
                    arquivos_mp3 = [
                        f for f in os.listdir(pasta_destino)
                        if f.endswith('.mp3')
                    ]
                    
                    if arquivos_mp3:
                        arquivo_mais_recente = max(
                            [os.path.join(pasta_destino, f) for f in arquivos_mp3],
                            key=os.path.getctime
                        )
                        nome_arquivo = os.path.basename(arquivo_mais_recente)
                        
                        # Atualizar lista com nome real
                        self.songs_listbox.delete(0)
                        self.downloaded_songs = [nome_arquivo.replace('.mp3', '')]
                        self.songs_listbox.insert(0, f"✅ {nome_arquivo.replace('.mp3', '')}")
                        self.songs_listbox.itemconfig(0, fg=self.success_color)
                        
                        self.atualizar_progresso(100, "Concluído!")
                        self.atualizar_status(f"✅ Download concluído!", "#00ff00")
                        
                        self.root.after(0, lambda: messagebox.showinfo(
                            "Sucesso!",
                            f"✅ Download do {source_name} concluído!\n\n"
                            f"Arquivo salvo em:\n{arquivo_mais_recente}"
                        ))
                    else:
                        raise Exception("Arquivo MP3 não encontrado após conversão")
                else:
                    raise Exception(f"Erro no yt-dlp: {resultado.stderr[:500]}")
                
        except subprocess.TimeoutExpired:
            self.root.after(0, lambda: self.tratar_erro(
                "Timeout: O download demorou muito tempo.\nTente novamente."
            ))
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
        """Exibe mensagem de erro para o usuário."""
        self.atualizar_status("❌ Erro no download", self.accent_color)
        self.atualizar_progresso(0, "")
        
        # Atualiza último item para erro se existir
        if self.songs_listbox.size() > 0:
            ultimo_idx = self.songs_listbox.size() - 1
            item_text = self.songs_listbox.get(ultimo_idx)
            if item_text.startswith("⏳"):
                novo_texto = item_text.replace("⏳", "❌", 1)
                self.songs_listbox.delete(ultimo_idx)
                self.songs_listbox.insert(ultimo_idx, novo_texto)
                self.songs_listbox.itemconfig(ultimo_idx, fg=self.accent_color)
        
        # Simplifica mensagens de erro comuns
        if "network" in mensagem.lower() or "connection" in mensagem.lower():
            mensagem = "Erro de conexão. Verifique sua internet e tente novamente."
        elif "private" in mensagem.lower():
            mensagem = "Este vídeo é privado e não pode ser baixado."
        elif "not available" in mensagem.lower() or "unavailable" in mensagem.lower():
            mensagem = "Vídeo não disponível. Pode ter sido removido ou está bloqueado."
        elif "sign in" in mensagem.lower():
            mensagem = "Este vídeo requer login e não pode ser baixado."
        elif "Timeout" in mensagem:
            mensagem = "O download demorou muito. Tente novamente."
            
        messagebox.showerror("Erro no Download", f"❌ {mensagem}")
        
    def restaurar_botao(self):
        """Restaura o botão para o estado normal."""
        if self.is_playlist:
            if self.url_type == "youtube_music":
                self.download_btn.configure(
                    text="🎵 Baixar Playlist YouTube Music",
                    bg=self.button_music_bg,
                    state=tk.NORMAL
                )
            else:
                self.download_btn.configure(
                    text="📋 Baixar Playlist Inteira",
                    bg=self.button_playlist_bg,
                    state=tk.NORMAL
                )
        else:
            if self.url_type == "youtube_music":
                self.download_btn.configure(
                    text="🎵 Baixar do YouTube Music",
                    bg=self.button_music_bg,
                    state=tk.NORMAL
                )
            else:
                self.download_btn.configure(
                    text="⬇️ Baixar MP3",
                    bg=self.button_bg,
                    state=tk.NORMAL
                )


def main():
    """Ponto de entrada da aplicação."""
    root = tk.Tk()
    
    # Configurar estilo da barra de progresso
    style = ttk.Style()
    style.theme_use('default')
    style.configure(
        "TProgressbar",
        background='#28a745',
        troughcolor='#2d2d2d',
        bordercolor='#2d2d2d',
        lightcolor='#28a745',
        darkcolor='#28a745'
    )
    
    app = YouTubeToMP3Converter(root)
    root.mainloop()


if __name__ == "__main__":
    main()
