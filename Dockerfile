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
    ruby-dev \
    build-essential \
    dnsutils \
    whois \
    netcat \
    dirb \
    perl && \
    gem install bundler

# Install WhatWeb manually
RUN git clone https://github.com/urbanadventurer/WhatWeb /opt/whatweb && \
    cd /opt/whatweb && \
    bundle install && \
    ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# Install Nikto manually
RUN git clone https://github.com/sullo/nikto.git /opt/nikto && \
    ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto && \
    chmod +x /usr/local/bin/nikto

# Copy project files
COPY package*.json ./
COPY scanner.js .
COPY summarize.js .  # <-- Make sure summarize.js is copied too

# Install Node.js dependencies
RUN npm install

# Expose port (optional if you're running a web server)
EXPOSE 8080

# Start the app
CMD ["node", "scanner.js"]
