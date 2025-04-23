# Base image with Node 18 and Debian Bullseye
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install all scanning tools and dependencies
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

# Install Nikto manually
RUN git clone https://github.com/sullo/nikto.git /opt/nikto && \
    ln -s /opt/nikto/nikto.pl /usr/local/bin/nikto && \
    chmod +x /usr/local/bin/nikto

# Copy app files
COPY package*.json ./
COPY scanner.js .

# Install Node.js dependencies
RUN npm install

# Expose the port for Railway (very important!)
EXPOSE 8080

# Start your scanner app
CMD ["node", "scanner.js"]
