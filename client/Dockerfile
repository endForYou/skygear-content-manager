FROM node:8

WORKDIR /usr/src/app

RUN npm install -g http-server

COPY @types /usr/src/app/@types
COPY package.json /usr/src/app/package.json

RUN npm install

COPY . /usr/src/app

RUN npm run build

CMD ["http-server", "build", "-p", "80"]
