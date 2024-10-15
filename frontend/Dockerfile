# Use the official Node.js image to build and run the back-end project
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the API port
EXPOSE 5173

# Start the Node.js server
CMD ["npm", "run", "dev"]