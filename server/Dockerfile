FROM node:latest
WORKDIR /app

COPY . .

RUN npm i -g typescript

RUN rm -rf client/
RUN npm install
RUN tsc -p .

ENTRYPOINT [ "npm", "start" ]