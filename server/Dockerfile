FROM node:20-alpine

WORKDIR /app

COPY ./ ./

RUN npm install

# Make sure the startup script is executable
RUN chmod +x ./startup.sh

EXPOSE 3000

CMD ["/bin/sh", "./startup.sh"] 