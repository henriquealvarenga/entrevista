#!/usr/bin/env python3
"""Servidor estático de DESENVOLVIMENTO com cache DESLIGADO.

O `python -m http.server` padrão deixa o navegador cachear HTML/JS, o que faz
servir versões antigas durante o desenvolvimento das atividades. Este servidor
manda cabeçalhos no-store em tudo, garantindo que cada reload pega o arquivo atual.

Uso (a partir da raiz do projeto):
    python3 code/devserver.py [porta]      # porta padrão: 8000
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # raiz do projeto


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


with Server(("", PORT), NoCacheHandler) as httpd:
    print(f"Servindo {ROOT} (SEM cache) em http://localhost:{PORT}")
    httpd.serve_forever()
