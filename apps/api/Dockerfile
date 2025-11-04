FROM node:18-alpine
WORKDIR /app

# Install wget for healthchecks
RUN apk add --no-cache wget

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=20s CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["node", "dist/index.js"]
