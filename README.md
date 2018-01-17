### Development with docker

## Serve with dev server

```
$ docker-compose -f docker-compose.dev.yml build
$ docker-compose -f docker-compose.dev.yml up
```

Enter `localhost:3002` to start development.

## Serve with built static files

```
$ docker-compose build
$ docker-compose up
```

Enter `localhost:3001/cms`.
