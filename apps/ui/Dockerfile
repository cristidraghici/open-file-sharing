# Build stage targeting development
FROM node:24-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Start development server
CMD ["npm", "run", "start"]
