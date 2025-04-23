# Base image
FROM node:18-bullseye

# Working directory
WORKDIR /app

# Install apt packages
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    git \
    curl \
    nmap \
    ruby \
    build-essential \
    ruby-dev \
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
    ln -s /opt/nikto/nikto.pl /usr/local/bin/nikto

# Copy project files
COPY package*.json ./
COPY scanner.js .

# Install Node.js dependencies
RUN npm install

# Run the scanner
CMD ["node", "scanner.js"]
