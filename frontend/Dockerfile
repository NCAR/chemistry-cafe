# Use the official Node.js image to build and run the back-end project
FROM node:18

COPY . ChemistryCafeFrontend/
WORKDIR /ChemistryCafeFrontend

RUN npm install

# Expose the API port
EXPOSE 5173

# Create a production build
RUN npm run build

# Default command for production
CMD ["npm", "run", "start"]