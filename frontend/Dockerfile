# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install dependencies (use --legacy-peer-deps to ignore strict peer warnings from @pinia-plugin-persistedstate/nuxt)
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build the Nuxt app
ARG BACKEND_URL=http://backend:3000
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/.output ./.output

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start command for Nuxt 3
CMD ["node", ".output/server/index.mjs"]
