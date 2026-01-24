FROM node:18-alpine

# Add build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy all files first
COPY . .

# Install dependencies fresh in the container (fixes bcrypt architecture issues)
RUN rm -rf node_modules package-lock.json && npm install

# Build TypeScript
RUN npm run build

EXPOSE 8085

CMD ["node", "dist/server.js"]
