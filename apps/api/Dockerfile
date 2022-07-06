FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build api

FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=build /app/dist/apps/api/main.js* ./
EXPOSE 3000
CMD ["node", "./main.js"]