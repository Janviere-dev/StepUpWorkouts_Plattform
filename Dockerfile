e a Node.js Long Term Support (LTS) image as the base
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy both folders into the container
COPY Backend ./Backend
COPY Frontend ./Frontend

# Install backend dependencies
RUN cd Backend && npm install

# Expose the desired port
EXPOSE 8080

# Start the server
CMD ["node", "Backend/server.js"]
