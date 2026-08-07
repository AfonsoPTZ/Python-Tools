FROM node:24-slim

WORKDIR /app

# Python3, LibreOffice (DOCX/XLSX/PPTX -> PDF) e FFmpeg (video -> MP3) sao instalados na mesma imagem
# porque os conversores rodam como processos filhos do Node chamando esses binarios.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip libreoffice ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# package.json primeiro para o Docker reaproveitar o cache de "npm ci" quando so o codigo mudar.
COPY package.json package-lock.json ./
RUN npm ci

# requirements.txt tambem copiado antes do restante do codigo, pelo mesmo motivo de cache.
COPY converters/requirements.txt ./converters/requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r converters/requirements.txt

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
# Debian nao tem o binario "python" por padrao, so "python3"; o pythonRunner.ts respeita essa variavel.
ENV PYTHON_BIN=python3

EXPOSE 3000

CMD ["node", "dist/server.js"]
