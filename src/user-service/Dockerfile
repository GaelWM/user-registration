FROM node:18.0-slim

WORKDIR /app

COPY ./src/user-service/package*.json ./

RUN npm install

COPY ./src/user-service/ .

EXPOSE 3000

CMD ["npm", "start"]