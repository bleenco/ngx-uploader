FROM node:9.3-alpine

WORKDIR /var/www/html

RUN apk --no-cache  update \
    && apk --no-cache  upgrade \
    && apk add --no-cache bash \
    python \
    && npm install


COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN ["chmod", "+x", "/usr/local/bin/entrypoint.sh"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
