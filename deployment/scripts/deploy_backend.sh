cd %~dp0/../../backend
yarn install
yarn prisma db push
yarn prisma db seed
yarn ts-node index.ts
