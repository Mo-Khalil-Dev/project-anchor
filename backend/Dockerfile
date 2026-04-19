FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy built app
COPY dist ./dist

# Copy Prisma files
COPY prisma ./prisma
COPY node_modules/.prisma ./node_modules/.prisma

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
