# Use a Node.js Long Term Support (LTS) image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json from the Backend directory to the working directory
# This allows caching of dependencies
COPY ./Backend ./Backend
COPY ./Frontend ./Frontend

# Install application dependencies
RUN cd Backend && npm install

# Copy the rest of the application code (both frontend and backend)

# Expose the port your application listens on (port 5000)
EXPOSE 8080

# Define the command to run your application (starting server.js from the Backend directory)
CMD ["node", "Backend/server.js"]
