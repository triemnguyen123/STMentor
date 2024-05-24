# Sử dụng Node.js làm image nền
FROM node

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json vào thư mục làm việc
COPY package.json package-lock.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

# Xây dựng ứng dụng Next.js
RUN npm run build

# Thiết lập biến môi trường cho production
ENV NODE_ENV=production

# Mở cổng 3000 để truy cập ứng dụng
EXPOSE 3000

# Chạy ứng dụng Next.js
CMD ["npm", "start"]
