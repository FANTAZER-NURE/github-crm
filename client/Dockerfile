FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY ./ ./

# Install dependencies with specific flags for better cross-platform compatibility
RUN yarn

EXPOSE 5173
# Use a startup script instead of direct command for better error handling
CMD ["sh", "-c", "yarn run dev"] 