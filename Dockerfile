FROM node:18-bullseye

WORKDIR /app

# Install core audit tools & dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  git \
  curl \
  nmap \
  ruby \
  ruby-dev \
  build-essential \
  dnsutils \
  whois \
  netcat \
  dirb \
  perl

# Install WhatWeb manually
RUN git clone https://github.com/urbanadventurer/WhatWeb /opt/whatweb && \
    ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# ✅ FIXED: Correct Nikto install path
RUN git clone https://github.com/sullo/nikto.git /opt/nikto && \
    ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto && \
    chmod +x /usr/local/bin/nikto

# Copy your project files
COPY package*.json ./
COPY scanner.js .

# Install Node dependencies
RUN npm install

EXPOSE 8080

CMD ["node", "scanner.js"]
