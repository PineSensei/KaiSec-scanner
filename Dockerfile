# Use Node.js base image
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install required Linux packages
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

# Clone and set up WhatWeb
RUN git clone https://github.com/urbanadventurer/WhatWeb /opt/whatweb && \
    cd /opt/whatweb && \
    bundle install && \
    ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# Clone and set up Nikto
RUN git clone https://github.com/sullo/nikto.git /opt/nikto && \
    ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto && \
    chmod +x /usr/local/bin/nikto

# Copy Node.js files
COPY package*.json ./
COPY scanner.js .
COPY summarize.js .

# Install Node.js dependencies
RUN npm install

# Expose a port (if your app needs to be accessed externally)
EXPOSE 8080

# Run the scanner
CMD ["node", "scanner.js"]
