# Use the official Playwright image
FROM mcr.microsoft.com/playwright:v1.63.0-noble

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application
COPY . .

# Default command (can be overridden)
CMD ["npx", "playwright", "test"]
