FROM node:18-bullseye

WORKDIR /app

# Install system tools and dependencies
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
  perl \
  cpanminus && \
  cpanm LWP::Protocol::https

# Install WhatWeb with all Ruby dependencies
RUN git clone https://github.com/urbanadventurer/WhatWeb /opt/whatweb && \
    cd /opt/whatweb && gem install bundler && bundle install && \
    ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# Install Nikto manually
RUN git clone https://github.com/sullo/nikto.git /opt/nikto && \
    ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto && \
    chmod +x /usr/local/bin/nikto

# Copy app files
COPY package*.json ./
COPY scanner.js .

# Install Node dependencies
RUN npm install

# Expose Railway-required port
EXPOSE 8080

CMD ["node", "scanner.js"]
