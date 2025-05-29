FROM node:18-alpine

# Instala curl (necessário para o healthcheck funcionar)
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3000


COPY . .

CMD ["npm", "start"]
