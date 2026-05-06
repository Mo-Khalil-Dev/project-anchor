# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl openssl-dev

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy prisma files first
COPY prisma ./prisma

# Generate Prisma Client BEFORE TypeScript compilation
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Compile TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set environment variables with defaults
ENV TINK_LINK_BASE_URL=https://link.tink.com
ENV TINK_API_BASE_URL=https://api.tink.com/api/v1
ENV TINK_EXPENSES_API_BASE_URL=https://api.tink.com/risk/v1
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run application
CMD ["node", "dist/index.js"]
