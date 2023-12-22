cd %~dp0/../../backend
set NODE_ENV=production
yarn install
yarn prisma db push
yarn prisma db seed
yarn nodemon index.ts
