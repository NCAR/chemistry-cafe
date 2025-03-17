# Use the official Node.js image to build and run the back-end project
# This stage is used for both the production and development build
FROM node:18 AS build

COPY . ChemistryCafeFrontend/
WORKDIR /ChemistryCafeFrontend

RUN npm install

# Expose the development API port
EXPOSE 5173

# Create a production build
RUN npm run build

# Second stage serves static files. This stage is used in the production build
FROM nginx:latest AS serve

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /ChemistryCafeFrontend/dist /usr/share/nginx/html

# Expose the production API port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
