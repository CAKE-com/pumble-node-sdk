FROM node:24.13-alpine AS builder

ENV APP_HOME=/root/
WORKDIR $APP_HOME
COPY . .
RUN apk update && apk add bash
RUN npm ci
RUN npm run compile
RUN npm list -a

FROM node:24.13-alpine
WORKDIR /root/

RUN npm uninstall npm -g

# CVE-2022-48174
RUN apk add --upgrade busybox-binsh
# CVE-2025-9230
RUN apk add --upgrade openssl
RUN apk upgrade --no-cache

COPY --from=builder /root/dist ./dist
COPY --from=builder /root/package.json .
COPY --from=builder /root/manifest.json .
COPY --from=builder /root/node_modules node_modules/

CMD ["node", "dist/index.js"]

