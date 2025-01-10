# Stage 1: Base Image
FROM node:18-alpine AS base

# Install Python (required by node-gyp) and other build dependencies
RUN apk add --no-cache python3 py3-pip build-base
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package manager lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Expose the port for development server
EXPOSE 3000

# Default environment variables for development
ENV NODE_ENV development
ENV AUTH_TRUST_HOST=true

# Command to start the Next.js development server
CMD ["pnpm", "dev"]