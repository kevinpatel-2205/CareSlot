# Use Node image
FROM node:20-alpine

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Vite port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host"]