FROM node:18

WORKDIR /app

# Dependencies copy aur install krte hain
COPY package*.json ./
RUN npm install

# Saara project code copy krte hain
COPY . .

# TypeScript aur Vite ko build krte hain (dist folder generate hoga)
RUN npm run build

EXPOSE 3000

# package.json wali start script chalayega (node dist/server.js)
CMD ["npm", "start"]
