FROM node:20

WORKDIR /app

RUN npm i -g @nestjs/cli

CMD ["tail", "-f", "/dev/null"]
