# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (production + dev)
# We need dev dependencies if you have a build step (e.g., Babel, Typescript)
# If not, 'npm ci --only=production' is enough in the runner stage.
# Here we assume standard install for flexibility.
RUN npm ci

# Copy source code
COPY . .

# (Optional) Run build scripts here if needed
# RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Stage 2: Production Runner
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only necessary files from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/config ./config
# Copy views if you use server-side rendering
COPY --from=builder /usr/src/app/views ./views

# Set ownership to non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
