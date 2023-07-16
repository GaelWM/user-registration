FROM node:18.0-slim

WORKDIR /app

COPY ./src/email-service/package*.json ./

RUN npm install

COPY ./src/email-service/ .

EXPOSE 4000

CMD ["npm", "start"]