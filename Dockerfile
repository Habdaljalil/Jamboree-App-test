# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Install deps first for caching
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.* ./
RUN npm install

# Copy project files
COPY . .

# Build frontend (Vite) + backend (esbuild)
RUN npm run build

# Stage 2: Runtime container
FROM node:20-slim

WORKDIR /app

# Copy only built files + package.json
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/index.js"]