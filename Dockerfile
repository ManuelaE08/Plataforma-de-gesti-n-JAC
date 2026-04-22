# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Pass environment variables for production build
ARG VITE_AUTH
ARG VITE_ENDPOINT
ARG VITE_ASOCOMUNALES_ENDPOINT
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_AUTH=$VITE_AUTH
ENV VITE_ENDPOINT=$VITE_ENDPOINT
ENV VITE_ASOCOMUNALES_ENDPOINT=$VITE_ASOCOMUNALES_ENDPOINT
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine

# Copy the build output to Nginx default public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration to handle SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html =404; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
