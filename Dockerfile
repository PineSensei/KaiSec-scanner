# Use a base image with Node.js and Python
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install dependencies
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
    nikto

# Install WhatWeb manually
RUN git clone https://github.com/urbanadventurer/WhatWeb /opt/whatweb && \
    ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# Copy project files
COPY package*.json ./
COPY scanner.js .

# Install Node dependencies
RUN npm install

# Set default command
CMD ["node", "scanner.js"]
