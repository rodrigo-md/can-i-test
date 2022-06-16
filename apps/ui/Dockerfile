FROM node:14-alpine as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build ui

FROM nginx:stable-alpine
COPY --from=build /app/dist/apps/ui /usr/share/nginx/html
COPY --from=build /app/apps/ui/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]