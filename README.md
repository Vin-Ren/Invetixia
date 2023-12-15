# Invetixia
Invetixia is an event management system. It aims to ease the process of managing administration from creating invitations with a lot of flexibility, sending it to a list of invitee, managing invitee's tickets which have a list of quotas based on the invitation or can be custom for each people.

> [!NOTE]
> This README only covers backend. Frontend is still a WIP.
> When the project is production ready, it is planned that a process manager would be used.

## Sections
1. [Installation](#installation)
2. [Usage](#usage)
3. [Development](#development)

---

## Installation
The only prerequisites are Node and a package manager. (and python for testing)

Start by entering the backend directory with `cd backend` and install the required dependencies:
```bash
# npm
npm install

# yarn
yarn install
```

Copy the [.example.env](./backend/.example.env) file as .env and modify the configurations. As an alternative, setting the variables as environment variables directly is also doable.
Then go into the [config folder](./backend/config/) and modify the files as required.

Run prisma migrate to initialize the database:
```bash
# npx
npx prisma migrate dev

# yarn
yarn prisma migrate dev
```

## Usage
Change directory to backend with `cd backend`, then run:
```bash
# npx
npx ts-node index.ts

# yarn
yarn ts-node index.ts
```


## Development

### Testing
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
