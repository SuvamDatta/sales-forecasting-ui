# Stage 1: Build the Angular application
FROM node:16.20.2 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install -g @angular/cli@16.2.15
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Angular application
RUN ng build --configuration production

# Stage 2: Serve the Angular application with Nginx
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application to Nginx server
COPY --from=build /app/dist/sales-forecasting-uiapp /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
