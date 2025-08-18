# # Build
# FROM node:20-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # Runtime
# FROM node:20-alpine
# WORKDIR /app
# ENV NODE_ENV=production
# COPY --from=build /app ./
# EXPOSE 3000
# CMD ["npm", "start"]

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

# En dev, on ne copie pas le code ici, on le monte en volume
ENV NODE_ENV=development

EXPOSE 3000
CMD ["npm", "run", "dev"]

