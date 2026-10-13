FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace backend

COPY backend ./backend
RUN npm run build --workspace backend

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace backend --omit=dev

COPY backend ./backend
COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
