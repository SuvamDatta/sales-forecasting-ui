# Stage 1: Build the Angular application
FROM node:16.20.2 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Stage 2: Serve the Angular application using a lightweight web server
FROM nginx:alpine

# Copy the built Angular application from the build stage
COPY --from=build /app/dist/my-angular-app /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
