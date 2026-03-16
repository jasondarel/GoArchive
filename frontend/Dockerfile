FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application code
COPY . .

# Expose port and start
EXPOSE 3000

# Next.js development server
CMD ["sh", "-c", "npm install && npm run dev"]
