# Getting Started with Join Map Server

### Yarn

```bash
$ npm install --global yarn
$ yarn --version
```

### Installation

```bash
$ yarn
```

### Local PostgreSQL Server
See instructions on [https://www.postgresql.org/download/](https://www.postgresql.org/download/)


### Env Variables
```bash
$ cp .env.example .env
```

Change the following to your local PostgreSQL Server
DATABASE_HOST=localhost
DATABASE_NAME=join-map-db
DATABASE_PASSWORD=postgre
DATABASE_PORT=5432
DATABASE_USERNAME=postgres

Run Join-Map-client and Register a user to get the User ID for admin access.
Change the role of the registered user to `admin` under `user` table.
Copy the id of the user from `user` table and change value of `USER_ADMIN_ID` on .env file.



### Database Sync and Seed

```bash
$ yarn migration:sync
$ yarn seed:run
```

### Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

###
```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
