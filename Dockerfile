FROM node:18.16.0

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN apt install python3
RUN npm install

# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "app.js" ]