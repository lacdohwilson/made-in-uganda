FROM node:22-alpine

# Create app user
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies (as root)
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Change ownership AFTER install
RUN chown -R app:app /app

# Switch to non-root user
USER app

EXPOSE 9000

CMD ["node", "src/server.js"]