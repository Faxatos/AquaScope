# Stage 1: Build
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

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

# Install pnpm globally
RUN npm install -g pnpm

# Install only production dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Set the environment variable to production
ENV NODE_ENV production

# Expose port 3000
EXPOSE 3000

# Command to run the Next.js application
CMD ["pnpm", "start"]
