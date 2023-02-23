FROM node:17-alpine as builder
WORKDIR /src
COPY .npmrc .npmrc
COPY package*.json ./

ARG GITHUB_TOKEN
ENV NODE_ENV production
RUN npm install
RUN rm -f .npmrc

COPY . ./
EXPOSE 3000

RUN npm run build --production
RUN npm install -g serve
CMD serve -s build
