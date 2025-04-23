FROM debian:bullseye

# --- Install dependencies ---
RUN apt-get update && apt-get install -y \
    curl gnupg git build-essential python3 python3-pip \
    ruby ruby-dev nodejs npm golang-go unzip

# Install latest Node
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Set workdir
WORKDIR /app

# Copy source
COPY . .

# --- Compile Go-based tools ---
RUN cd tools/nuclei/v2/cmd/nuclei && go build && cp nuclei /usr/local/bin/nuclei && \
    cd /app/tools/subfinder/v2/cmd/subfinder && go build && cp subfinder /usr/local/bin/subfinder && \
    cd /app/tools/httpx/cmd/httpx && go build && cp httpx /usr/local/bin/httpx

# --- Symlink other tools ---
RUN ln -s /app/tools/whatweb/whatweb /usr/local/bin/whatweb && \
    ln -s /app/tools/nikto/program/nikto.pl /usr/local/bin/nikto && \
    ln -s /app/tools/dirsearch/dirsearch.py /usr/local/bin/dirsearch && \
    chmod +x /usr/local/bin/*

# --- Python deps for sslyze ---
RUN pip3 install -r tools/sslyze/requirements.txt

# --- Node setup ---
RUN npm install

EXPOSE 3000
CMD ["node", "scanner.js"]

