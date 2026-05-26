FROM node:18

WORKDIR /app

# Sirf package.json copy karte hain (lock file ignore ho chuki hai)
COPY package.json ./

# Fresh aur clean dependencies install karne ke liye
RUN npm install

COPY . .

# Vite + TypeScript compilation
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
