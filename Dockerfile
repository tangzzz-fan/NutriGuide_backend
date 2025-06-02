# Build stage
FROM node:18-alpine AS builder

# Accept build argument for environment
ARG NODE_ENV=production
ENV NODE_ENV=development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for building (including dev dependencies)
RUN npm ci && npm cache clean --force

# Copy configuration files needed for build
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Development stage - for development only
FROM node:18-alpine AS development

# Accept build argument for environment
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci && npm cache clean --force

# Copy TypeScript configuration files
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code
COPY src ./src

# Create dist directory with proper permissions
RUN mkdir -p dist && chmod 755 dist

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:18-alpine AS production

# Accept build argument for environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy environment files
COPY --chown=nestjs:nodejs .env.* ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/main.js || exit 1

# Start the application
CMD ["node", "dist/main.js"] 