# ── Frontend ─────────────────────────────────────────
FROM node:20-slim AS frontend

WORKDIR /app

# Deps d'abord (cache Docker)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Code source
COPY . .

EXPOSE 3000

# En dev : hot reload. En prod : build + start.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
