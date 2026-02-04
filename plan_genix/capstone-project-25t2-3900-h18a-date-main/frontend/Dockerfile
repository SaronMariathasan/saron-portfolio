FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm rebuild esbuild
COPY . .
EXPOSE 5173
# --host so Vite binds 0.0.0.0 inside container
CMD ["npm", "run", "dev", "--", "--host"]
