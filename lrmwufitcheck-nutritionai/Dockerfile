FROM public.ecr.aws/docker/library/node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=400"
CMD ["npm", "run", "start-prod"]
