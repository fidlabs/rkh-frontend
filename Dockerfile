FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Accept build argument for environment only
ARG NEXT_PUBLIC_APP_ENVIRONMENT

# Set the environment variable during build
ENV NEXT_PUBLIC_APP_ENVIRONMENT=${NEXT_PUBLIC_APP_ENVIRONMENT:-production}

RUN npm run build

# Production Stage 

FROM node:18-alpine AS production

# Accept build argument for environment in production stage too
ARG NEXT_PUBLIC_APP_ENVIRONMENT

WORKDIR /app

# Copy the built artifacts from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set only the essential environment variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_ENVIRONMENT=${NEXT_PUBLIC_APP_ENVIRONMENT:-production}

EXPOSE 3000

CMD ["node", "server.js"]


