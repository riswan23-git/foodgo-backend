# Gunakan versi Node.js yang stabil
FROM node:18

# Tentukan folder kerja di dalam Docker
WORKDIR /app

# Salin package.json untuk instalasi library
COPY package*.json ./

# Instal semua library yang dibutuhkan (termasuk Jest)
RUN npm install

# Salin semua kode backend ke dalam Docker
COPY . .

# Jalankan server
CMD ["npm", "start"]