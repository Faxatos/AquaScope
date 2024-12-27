# Stage 1: Build
FROM node:18-alpine AS builder

# Install Python (required by node-gyp)
RUN apk add --no-cache python3 py3-pip build-base
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install TypeScript and the required dependencies for Next.js with TypeScript support
RUN npm install -g typescript @types/react @types/node

# Copy package manager lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN pnpm build

# Stage 2: Production
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

RUN apk add --no-cache python3 py3-pip build-base
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install pnpm globally
RUN npm install -g pnpm

# Install TypeScript and the required dependencies for Next.js with TypeScript support
RUN npm install -g typescript @types/react @types/node

# Set environment variable for trustHost to true (for Auth.js configuration)
ENV AUTH_TRUST_HOST=true

# Install only production dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Set the environment variable to production
ENV NODE_ENV production

# Expose port 3000
EXPOSE 3000

# Command to run the Next.js application
CMD ["pnpm", "start"]
