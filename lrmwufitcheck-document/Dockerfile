FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_FOLDER=/app/static
ENV DOC_TITLE="FitCheck Documentation"

EXPOSE 3000

CMD ["node", "server.js"]
