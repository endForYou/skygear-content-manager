FROM node:8

WORKDIR /usr/src/app

# npm ci needs >= 5.7.0
RUN npm install -g npm@^5.7.0
RUN npm install -g http-server

COPY package.json package-lock.json /usr/src/app/

RUN npm ci

COPY . /usr/src/app

RUN npm run build

CMD ["http-server", "build", "-p", "80"]
