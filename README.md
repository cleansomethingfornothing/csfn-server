# CSFN Server

Server for the CSFN App.

## Environment variables
Se necesitan algunas variables de entorno para arrancar en modo desarrollo

| Variable | Valor|
|---|---|
| NODE_ENV | development |
| GOOGLE_APPLICATION_CREDENTIALS | Clave de Google Cloud ([Info](https://cloud.google.com/docs/authentication/getting-started)) |

Para las configuraciones se duplica el archivo **.example.env** creando un **.development.env** para desarrollo y un **.production.env** para produciión.

## Install dependencies

```bash
$ npm install
```

## Running the server

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
