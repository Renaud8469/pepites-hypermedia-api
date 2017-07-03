FROM node:6

RUN mkdir -p /srv/app

EXPOSE 3004

ADD ./package.json /srv/app/
WORKDIR /srv/app
RUN npm install --production

ADD ./defaults.json ./
ADD ./bin ./bin

CMD npm start
