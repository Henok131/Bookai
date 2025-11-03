FROM node:18-alpine
WORKDIR /app

# Install wget for healthchecks
RUN apk add --no-cache wget

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json vite.config.ts index.html ./
COPY tailwind.config.ts postcss.config.js ./
COPY src ./src

RUN npm run build

EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=30s CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
