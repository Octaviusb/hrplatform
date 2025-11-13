FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Install all deps to build and generate Prisma client
RUN npm ci

# Build TypeScript and generate Prisma client
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma

# Install only production deps; postinstall (prisma generate) will succeed as schema is present
RUN npm ci --omit=dev

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/index.js"]
