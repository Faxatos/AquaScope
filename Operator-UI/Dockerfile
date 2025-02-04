# Use a Debian-based Node.js image for better compatibility
FROM node:18-buster AS base

# Set working directory
WORKDIR /app

# Install system dependencies required for node-gyp and kerberos
RUN apt-get update && apt-get install -y \
  python3 \
  build-essential \
  gcc \
  g++ \
  make \
  libkrb5-dev \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm and node-gyp globally
RUN npm install -g pnpm node-gyp

# Copy package manager lockfile and package.json
COPY package.json pnpm-lock.yaml ./

# Ensure environment variables are set before install
ENV NODE_ENV development
ENV AUTH_TRUST_HOST=true

# Install all dependencies, including development dependencies
RUN pnpm install --frozen-lockfile

# Rebuild kerberos to ensure native module is compiled correctly
RUN pnpm rebuild kerberos

# Copy the rest of the application files
COPY . .

# Expose port for Next.js development server
EXPOSE 3000

# Start Next.js application
CMD ["pnpm", "dev"]
