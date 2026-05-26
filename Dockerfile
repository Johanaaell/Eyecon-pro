# Node 20 use kar rahe hain taake saare modern packages support hon
FROM node:20

WORKDIR /app

# Package files copy krte hain
COPY package.json ./

# Fresh installation bina kisi purane cache maslay ke
RUN npm install

COPY . .

# Vite aur TypeScript compile krein
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
