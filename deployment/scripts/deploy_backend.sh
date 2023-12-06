cd ../../backend
yarn install
yarn prisma db push
yarn ts-node databaseSeed.ts
