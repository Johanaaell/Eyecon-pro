FROM node:20

# Yeh line lazmi add krein taake node defaults clear hon
ENV NODE_ENV=production

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
