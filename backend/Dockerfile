# =============================================================================
# WorkPulse Backend - Production Dockerfile (Multi-Stage Build)
# Architecture: Node.js 22 LTS Alpine (Slim, Secure, Non-Root)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies & Compilation
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (e.g. argon2 on musl)
RUN apk add --no-cache python3 make g++

# Copy package manifests first for efficient layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy Prisma schema and configuration
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client 7
RUN npx prisma generate --schema prisma/schema.prisma

# Copy source code and build configs
COPY tsconfig.json nest-cli.json ./
COPY src ./src

# Compile NestJS TypeScript to dist/
RUN npm run build

# Prune devDependencies to keep image lightweight
RUN npm prune --omit=dev

# -----------------------------------------------------------------------------
# Stage 2: Hardened Production Runtime
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3000

# Install dumb-init for proper PID 1 signal forwarding (SIGTERM / Graceful Shutdown)
RUN apk add --no-cache dumb-init

# Copy only required production artifacts from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Security: Enforce non-root execution (Least Privilege Principle)
RUN chown -R node:node /app
USER node

# Expose internal API port
EXPOSE 3000

# Docker Healthcheck: verify backend live probe responds 200 OK
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

# Start application via dumb-init for graceful shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
