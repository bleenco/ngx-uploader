FROM node:11-alpine

COPY . /app

WORKDIR /app

RUN npm install && npm run build:prod

ENTRYPOINT [ "node", "/app/dist/api/index.js" ]

EXPOSE 4900
