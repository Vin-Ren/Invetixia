# Invetixia
Invetixia is an event management system. It aims to ease the process of managing administration from creating invitations with a lot of flexibility, sending it to a list of invitee, managing invitee's tickets which have a list of quotas based on the invitation or can be custom for each people.

## Sections
1. [Installation](#installation)
2. [Usage](#usage)
3. [Development](#development)

---

## Installation
### Backend
The prerequisites are node, postgresql and a package manager. (and python for testing)

Start by entering the backend directory with `cd backend` and install the required dependencies:
```bash
# npm
npm install

# yarn
yarn install
```

Copy the .example.env file as .env and modify the configurations. As an alternative, setting the variables as environment variables directly is also doable, but note that variables in .env will always have greater priority.

Then to initialize the database and prisma client:
```bash
# npx
npx prisma db push
npx prisma db seed

# yarn
yarn prisma db push
yarn prisma db seed
```

### Frontend
The installation for both admin and public frontend are the same, replicate the steps for both

Within the each of the frontend directories, run the following:
```bash
yarn install
```
Copy the `.example.env` file to `.env.local` for development or `.env.production` for production build. After which, modify the configurations as needed.

---
## Usage
### Deploying Backend
For production, instead run the following to build:
```bash
# npm
npm run build

# yarn
yarn build
```
> The transpiled js files are in the backend/dist folder. The file that should be used is index.js

Then use your favorite process manager to run the compiled files.
```bash
# pm2
pm2 start --name invetixia-api dist/index.js
```

### Deploying Frontend
Deployment of both frontends are the same.
For production, run the following to build:
```bash
# npm
npm run build

# yarn
yarn build
```
The bundled files will be stored inside of the directory's `dist` folder.
You can now run a server serving the files inside the `dist` folder for each frontend. Another possible alternative is to upload it to a static file hosting site such as github pages or cloudflare pages. Either way, as long as the bundled files are served to the internet, you are done.

---
## Development
### Deploying Backend
For development, run:
```bash
# npx
npx ts-node index.ts

# yarn
yarn ts-node index.ts
```
### Deploying both Frontend
For each of the frontend directories, run:
```bash
# npm
npm run dev

# yarn
yarn dev
```

### Testing Backend
Backend testing uses python, hence an additional prerequisites.
Change directory to the backend directory to install the requirements.
```bash
cd backend
# windows
pip install test-requirements.txt
# unix
pip3 install test-requirements.txt
```

To run the test suite, while within inside the backend directory, simply call the module pytest:
```bash
# py launcher
py -m pytest

# windows
python -m pytest

# unix
python3 -m pytest
```
