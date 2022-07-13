FROM node:14-alpine as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build ui

FROM nginx:stable-alpine
COPY --from=build /app/dist/apps/ui /usr/share/nginx/html
COPY --from=build /app/apps/ui/infraestructure/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
#CMD "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
CMD ["nginx", "-g", "daemon off;"]