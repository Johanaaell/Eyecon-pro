FROM node:18

WORKDIR /app

# Pehle package files copy krte hain
COPY package*.json ./

# Sab dependencies install krte hain
RUN npm install

# Baaki saara code copy krte hain
COPY . .

# TypeScript ko build krte hain (JavaScript generate krne k liye)
RUN npm run build --if-present

EXPOSE 3000

# Agar package.json me start script hai to wo chalaye, warna direct server run kre
CMD ["npm", "start"]
