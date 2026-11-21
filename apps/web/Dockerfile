# Build the static site from the monorepo root (build context must be repo root).
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build -w @ui-monorepo/web

# Serve the static build with nginx; /api is proxied to the pbac Service.
FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
