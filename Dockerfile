FROM oven/bun:1.1-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 6006

ENV HOST=0.0.0.0
ENV PORT=6006

CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "6006"]
