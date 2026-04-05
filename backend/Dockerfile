FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port (adjust if your backend runs on a different port)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
