# Use a Node.js Long Term Support (LTS) image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json from the Backend directory to the working directory
# This allows caching of dependencies
COPY Backend/package*.json ./Backend/

# Install application dependencies
RUN npm install --prefix ./Backend

# Copy the rest of the application code (both frontend and backend)
COPY . .

# Expose the port your application listens on (port 5000)
EXPOSE 5000

# Define the command to run your application (starting server.js from the Backend directory)
CMD ["node", "Backend/server.js"]