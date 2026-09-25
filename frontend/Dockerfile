# Use the official Node.js image to build and run the back-end project
# This stage is used for both the production and development build
FROM node:18 AS base

COPY . ChemistryCafeFrontend/
WORKDIR /ChemistryCafeFrontend

RUN npm install

# Expose the development API port
EXPOSE 5173

FROM base AS build

# VITE_BASE_URL is the site origin, for example https://chemcafe-dev.k8s.ucar.edu.
# Leave it empty to use paths relative to the host that serves the frontend.
# Both variables are set in one ENV instruction, so that both read the ARG
# value and VITE_AUTH_URL does not get the "/api" suffix.
ARG VITE_BASE_URL=""
ENV VITE_AUTH_URL=${VITE_BASE_URL}/auth \
    VITE_BASE_URL=${VITE_BASE_URL}/api

# Create a production build
RUN npm run build

# Third stage serves static files. This stage is used in the production build
FROM nginxinc/nginx-unprivileged:latest AS final

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /ChemistryCafeFrontend/dist /usr/share/nginx/html

# nginx-unprivileged runs as a non-root user and cannot bind to port 80
EXPOSE 8080
