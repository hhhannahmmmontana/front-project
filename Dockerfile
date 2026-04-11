FROM node:24-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -g @angular/cli

COPY . .

RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/front-project /usr/share/nginx/html