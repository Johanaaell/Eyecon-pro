FROM node:20
# Production env initialize krein
ENV NODE_ENV=production
WORKDIR /app

# Dependency check mappings
COPY package*.json ./
RUN npm install

COPY . .

# Complete site bundle compile
RUN npm run build

# Hugging Face ka inner proxy system port 7860 expect karta hai
EXPOSE 7860
CMD ["npm", "start"]
