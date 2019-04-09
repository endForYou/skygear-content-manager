### Development with docker

## Serve with dev server

```sh
$ docker-compose -f docker-compose.dev.yml build
$ docker-compose -f docker-compose.dev.yml up
```

Go to [localhost:3002](http://localhost:3002) to start development.

Or if you want to work on the client locally

```sh
$ cd client
$ npm ci
$ npm start
```

Go to [localhost:3000](http://localhost:3000) to start development.

## Serve with built static files

```sh
$ docker-compose build
$ docker-compose up
```

Enter `localhost:3001/cms`.

## Install sample data

**Start skygear server first**

Set the following env if needed.

```
EXPORT SKYGEAR_ENDPOINT=
EXPORT API_KEY=
EXPORT USERNAME=
EXPORT PASSWORD=
```

```sh
# python3
$ python scripts/install_sample_data.py
```
