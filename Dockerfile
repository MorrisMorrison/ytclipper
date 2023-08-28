FROM node:18.16.0

WORKDIR /app

COPY . ./

RUN apt update && apt install -y python3 python3-pip python3-certifi ffmpeg

RUN npm install
RUN npm run build

EXPOSE 8080
CMD [ "node", "app.js" ]