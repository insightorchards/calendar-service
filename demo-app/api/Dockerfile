FROM node:17-alpine as builder
WORKDIR /
COPY .npmrc .npmrc
COPY package*.json ./

ARG GITHUB_TOKEN
ARG MONGO_CONNECTION_STRING
ENV NODE_ENV production
RUN echo $NODE_ENV
RUN npm install --omit=dev
RUN rm -f .npmrc

COPY . ./
EXPOSE 4000
CMD ["npm", "run", "start"]
