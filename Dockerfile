# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend source
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./

# Generate static SPA files
RUN npm run generate

# --- Stage 2: Build Backend & Combine ---
FROM node:20-alpine
WORKDIR /app

# Copy backend source
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./

# Copy generated frontend files into backend's public directory
COPY --from=frontend-builder /app/frontend/.output/public /app/public

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]