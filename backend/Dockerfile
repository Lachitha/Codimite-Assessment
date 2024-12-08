FROM node:alpine
 
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .
EXPOSE 85
 
CMD ["npm", "start"]
