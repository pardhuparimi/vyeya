# Production Dockerfile for Vyeya API - Enhanced Security & Performance
FROM node:22-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared

# Build the application
RUN pnpm build:server && pnpm build:shared

# Remove dev dependencies and clean cache
RUN pnpm prune --prod && pnpm store prune

# Production stage
FROM node:22-alpine AS production

# Install security updates and necessary tools
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create app user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=nodejs:nodejs packages/server/package.json ./packages/server/
COPY --chown=nodejs:nodejs packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune && \
    npm cache clean --force

# Copy built application with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/packages/server/dist ./packages/server/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create necessary directories
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "packages/server/dist/index.js"]
