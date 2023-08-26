FROM node:18.16.0

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . ./

EXPOSE 8080
CMD [ "node", "app.js" ]