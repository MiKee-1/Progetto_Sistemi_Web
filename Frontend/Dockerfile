# Production image, built in two stages (multi-stage build):
#   1. build: compile the Angular app with the production configuration
#   2. runtime: serve the static bundle with nginx (no Node in the final image)
# For the local development container (ng serve + live reload) see Dockerfile.dev.

# --- Stage 1: build ---
FROM node:22 AS build

WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile changes.
# npm ci installs exactly what package-lock.json pins, for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy the sources and build the production bundle
COPY . .
RUN npm run build

# --- Stage 2: runtime ---
FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/flowboard/browser /usr/share/nginx/html

EXPOSE 80
