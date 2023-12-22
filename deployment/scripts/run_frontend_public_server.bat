cd %~dp0/../../frontend/public
set NODE_ENV=production
yarn build
yarn preview --port 5176