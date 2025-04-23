FROM debian:bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
  curl gnupg ruby ruby-dev git build-essential nodejs npm

# Install WhatWeb from GitHub
RUN git clone https://github.com/urbanadventurer/WhatWeb.git /opt/whatweb && \
    ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install Node packages
RUN npm install

EXPOSE 3000
CMD ["node", "index.js"]
