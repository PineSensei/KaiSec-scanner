FROM debian:bullseye

# Install Node.js, Ruby, WhatWeb, and required tools
RUN apt-get update && \
    apt-get install -y curl gnupg ruby ruby-dev git build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    gem install whatweb

# App setup
WORKDIR /app
COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]
