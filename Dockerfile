FROM node:24.15.0-alpine

RUN addgroup -S app && adduser -S -G app app
USER app

WORKDIR /app
COPY --chown=app:app package*.json ./
RUN npm ci --omit=dev
COPY --chown=app:app . .

EXPOSE 9000

CMD ["node", "src/server.js"]