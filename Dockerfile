FROM node:18.16.0

# Create app directory
WORKDIR /app

COPY . ./

RUN npm install
RUN npm run build

EXPOSE 8080
CMD [ "node", "app.js" ]