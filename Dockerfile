# Simple production image to run the Express API (TypeScript via tsx)
# This image runs the combined service (API + static frontend) on port 3000

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

# Build the frontend so Express can serve /dist in the same service
RUN npm run build

# Expose service port
ENV PORT=3000
EXPOSE 3000

# Default command: run the server using tsx
ENV NODE_ENV=production
CMD ["npm", "run", "server"]
