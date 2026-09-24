# Use the official Node.js image to build and run the back-end project
# This stage is used for both the production and development build
FROM node:18 AS base

COPY . ChemistryCafeFrontend/
WORKDIR /ChemistryCafeFrontend

RUN npm install

# Expose the development API port
EXPOSE 5173

FROM base AS build

ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}/api
ENV VITE_AUTH_URL=${VITE_BASE_URL}/auth

# Create a production build
RUN npm run build

# Third stage serves static files. This stage is used in the production build
FROM nginxinc/nginx-unprivileged:latest AS final

COPY --from=build /ChemistryCafeFrontend/dist /usr/share/nginx/html
