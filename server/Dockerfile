# Use official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]