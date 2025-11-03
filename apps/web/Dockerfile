FROM node:18-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY tailwind.config.ts postcss.config.js ./
COPY src/index.css ./src/index.css

RUN npm run build

EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://localhost:5173 || exit 1
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
