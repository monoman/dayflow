FROM node:lts-alpine
# Use the official Node.js 20 image as the base image
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package.json ./
# Install the dependencies defined in package.json using yarn
RUN npm install yarn
RUN yarn install
# Copy the rest of the application code to the working directory
COPY . .
RUN yarn build 
# Expose the port that the application will run on
EXPOSE 9090
# Start the application using yarn
CMD ["yarn", "start"]
# Make sure to build the Docker image with the command:
# docker build -t your-image-name .
# and run the container with:
# docker run -p 9002:9002 your-image-name
# This will map port 9002 of the container to port 9002 on the host machine.
# Ensure that your application is set up to listen on port 9002
# and that the Dockerfile is located in the root directory of your Node.js project.
# This Dockerfile is intended for use in a development environment.
# It is recommended to use a multi-stage build for production deployments
# to reduce the image size and improve security.
# For production, consider using a multi-stage build to copy only the necessary files
# and to use a smaller base image.
# For example, you can use a multi-stage build to copy only the built application files
# and use a smaller base image like `node:20-slim` for the final image.
