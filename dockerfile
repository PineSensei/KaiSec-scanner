FROM debian:bullseye

# Install dependencies and WhatWeb
RUN apt-get update && \
    apt-get install -y ruby ruby-dev git curl build-essential && \
    gem install whatweb

# Setup Node environment
FROM node:18 as app

WORKDIR /app

# Copy WhatWeb from previous layer
COPY --from=0 /usr/local/bin/whatweb /usr/local/bin/whatweb
COPY --from=0 /var/lib/gems /var/lib/gems
ENV GEM_HOME=/var/lib/gems

# Copy app files
COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]

