# Use Node.js with a more compatible OS (Debian-based image for better compatibility)
FROM node:18-buster AS base

# Install dependencies required for node-gyp and kerberos
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    gcc \
    g++ \
    make \
    libkrb5-dev \
    && rm -rf /var/lib/apt/lists/*  # Clean up unnecessary files after installation

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm node-gyp

# Copy package manager lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Expose the port for the Next.js development server
EXPOSE 3000

# Default environment variables for development
ENV NODE_ENV development
ENV AUTH_TRUST_HOST=true

# Command to start the Next.js development server
CMD ["pnpm", "dev"]
