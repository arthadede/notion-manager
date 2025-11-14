# Simple production image to run the Express API (TypeScript via tsx)
# This image runs the backend only on port 3001

FROM node:20-alpine

# Install libc6-compat for some node modules if needed
RUN apk add --no-cache libc6-compat

# We'll set NODE_ENV at runtime; keep dev deps so `tsx` can run TypeScript
# (this project runs the server via `tsx server/index.ts`)
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* .npmrc* ./
# Install all dependencies including devDependencies (for tsx)
RUN npm ci --include=dev

# Copy the rest of the source code
COPY . .

# Expose backend port
EXPOSE 3001

# Default command: run the server using tsx
ENV NODE_ENV=production
CMD ["npm", "run", "server"]
