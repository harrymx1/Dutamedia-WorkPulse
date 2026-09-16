# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy source code and config
COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

# Build NestJS application
RUN npm run build

# Install production dependencies only for lean runtime
RUN npm prune --omit=dev --legacy-peer-deps

# Stage 2: Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: Run as non-root user
USER node

# Copy built application and production dependencies from builder stage
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
