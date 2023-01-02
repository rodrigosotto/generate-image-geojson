FROM node:14

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

#copy package.json file
COPY package*.json ./

USER node

#Install prettier (for our package`s build function)
#RUN npm install prettier -g

#Install files
RUN npm install

#copy source files
COPY --chown=node:node . .

#expose the app in port
EXPOSE 3000

CMD ["node", "generate.js"]