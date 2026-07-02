Chemistry Cafe
==============

[![GitHub Releases](https://img.shields.io/github/release/NCAR/chemistry-cafe.svg)](https://github.com/NCAR/chemistry-cafe/releases)
[![License](https://img.shields.io/github/license/NCAR/chemistry-cafe.svg)](https://github.com/NCAR/chemistry-cafe/blob/master/LICENSE)
[![Docker builds](https://github.com/NCAR/chemistry-cafe/actions/workflows/docker_image.yml/badge.svg)](https://github.com/NCAR/chemistry-cafe/actions/workflows/docker_image.yml)
[![NodeJS](https://github.com/NCAR/chemistry-cafe/actions/workflows/npm_build_test.yml/badge.svg)](https://github.com/NCAR/chemistry-cafe/actions/workflows/npm_build_test.yml)
[![Dotnet](https://github.com/NCAR/chemistry-cafe/actions/workflows/dotnet.yml/badge.svg)](https://github.com/NCAR/chemistry-cafe/actions/workflows/dotnet.yml)
[![codecov](https://codecov.io/gh/NCAR/chemistry-cafe/branch/main/graph/badge.svg?token=ATGO4DKTMY)](https://codecov.io/gh/NCAR/chemistry-cafe)
[![FAIR checklist badge](https://fairsoftwarechecklist.net/badge.svg)](https://fairsoftwarechecklist.net/v0.2?f=31&a=32113&i=22322&r=123)
[![DOI](https://zenodo.org/badge/67521334.svg)](https://doi.org/10.5281/zenodo.14171726)


ChemistryCafe is a web application built with React, Vite, and TypeScript. The app uses various libraries and frameworks such as MUI, Axios, and styled-components to provide a seamless and modern user experience. This README provides information about the application and how to run the code locally.

## Getting Started

### Environment variables

Chemistry Cafe reads its configuration from `.env` files. A committed template,
[`.env.example`](.env.example), lists every variable with working local-dev
defaults. Copy it to create the files you need:

```bash
# For Docker Compose (the usual way to run the app):
cp .env.example .env

# ONLY if you also run the backend outside Docker:
cp .env.example backend/.env      # then edit it: MYSQL_SERVER=localhost
```

Then fill in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — the only values
with no default. For Google Authentication, create a Google Cloud OAuth 2.0
client and add `http://localhost:8080/signin-google` to its "Authorized
redirect URIs".

**Which file is used when**

| File | Read by | Notes |
|------|---------|-------|
| `.env` (repo root) | `docker compose` | The normal way to run the app. |
| `backend/.env` | the backend **only when run outside Docker** (`dotnet run`, `dotnet test`, `dotnet ef …`) | Not read inside Docker. Set `MYSQL_SERVER=localhost` here. |
| `.env.example` | nobody at runtime | Committed template — update it when adding a variable. |

`.env` and `backend/.env` are git-ignored, so secrets are never committed.

**Variables** (all live in each `.env`; the only value that differs by run mode is `MYSQL_SERVER`)

| Variable | Required | Docker | Outside Docker |
|----------|:--------:|--------|----------------|
| `GOOGLE_CLIENT_ID` | ✅ | *(fill in)* | *(fill in)* |
| `GOOGLE_CLIENT_SECRET` | ✅ | *(fill in)* | *(fill in)* |
| `MYSQL_USER` | ✅ | `chemistrycafedev` | `chemistrycafedev` |
| `MYSQL_PASSWORD` | ✅ | `chemistrycafe` | `chemistrycafe` |
| `MYSQL_DATABASE` | ✅ | `chemistry_db` | `chemistry_db` |
| `MYSQL_SERVER` | | `mysql` *(compose service name)* | `localhost` |
| `MYSQL_PORT` | | `3306` | `3306` |
| `FRONTEND_HOST` | | `http://localhost:5173` | `http://localhost:5173` |
| `BACKEND_BASE_URL` | | `/` | `/` |

`FRONTEND_HOST` is where the frontend is served (used for backend CORS and OAuth
redirects); `BACKEND_BASE_URL` is the path prefix the backend is hosted under
(e.g. `/api/`). Both matter mainly in production.

### Running Chemistry Cafe with Docker Compose

You must have [Docker Desktop](https://www.docker.com/get-started) installed and running.
With Docker Desktop running, open a terminal window.
To build the project run:

```
$ docker compose up --build
```

To run project in background:

```
$ docker compose up -d
```

When finished, run:
```
$ docker compose down
```

To view logs for backend/frontend/sql:
```
$ docker compose logs backend
$ docker compose logs frontend 
$ docker compose logs sql 
```

To view logs for all services:
```
$ docker compose logs -f 
```

**Note:** To view changes, you must run the docker compose down and then run the project again.

### Local Development (without Docker)

#### Framework dependencies

- [.NET SDK 8.0](https://dotnet.microsoft.com/en-us/download) (backend)
- [Node.js 18](https://nodejs.org/en/download) (frontend)
- [dotnet-ef 8](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (migrations)
- [Docker](https://www.docker.com/) (optional but makes things easier)

#### Setup
1. **Clone the repository**:
Open a terminal window, navigate to a folder where you would like the Chemistry Cafe files to exist,
and run the following commands:

    ```
    $ git clone https://github.com/NCAR/chemistry-cafe.git
    $ cd chemistrycafe
    ```
2. **Install dependencies for frontend**:
    ```shell
    $ cd frontend
    $ npm install
    $ cd ..
    ```
4. **Install dependencies for backend**
    ```
    $ cd backend
    $ dotnet restore
    ```

### Database Migrations

The database comes with a provided `init.sql` which creates all of the database tables. To create the migrations, we use a tool called `dotnet-ef` of which the documentation can be found [here](https://learn.microsoft.com/en-us/ef/core/cli/dotnet).

To install the tool:

```bash
$ dotnet tool install --global dotnet-ef --version 8
```

The following commands are useful when developing the application. All of these must be executed in the `./backend` directory.

To create a migration:

```bash
$ dotnet ef migrations add <migration-name>
```

To apply migrations without generating a script:

```bash
$ dotnet ef database update
```

To generate a new init.sql script:

```bash
$ dotnet ef migrations script --idempotent -o init.sql
```

## Testing

Both suites run **outside Docker**, so make sure you've done the local setup
above (frontend `npm install`, backend `dotnet restore`).

### Frontend

```bash
cd frontend
npm run test:coverage
```
Coverage report: `frontend/coverage/index.html`.

### Backend

The backend tests need a running MySQL and a `backend/.env` with
`MYSQL_SERVER=localhost` (see [Environment variables](#environment-variables)).
The command below starts *only* the database in Docker and runs the tests on
your host:

```bash
docker compose up mysql -d      # start just the database
cd backend
dotnet test --collect:"Code Coverage;Format=cobertura"
cd ..
docker compose down
```

Generate an HTML + lcov coverage report:

```bash
reportgenerator -reports:"backend/TestResults/**/**.cobertura.xml" -targetdir:coveragereport -reporttypes:Html,lcov -classfilters:"-MySqlConnector.*;-ChemistryCafeAPI.Migrations.*" -filefilters:-/_/src/MySqlConnector/*,-backend/TestResults/**/coverage.cobertura.xml; rm -r ./backend/TestResults
```
Report: `backend/coveragereport/index.html`.

### Build check (compiles both, no tests)

```bash
dotnet build backend
cd frontend && npm run build
```


## Production

### Environment Setup

To build for production, there is a provided `docker-compose.production.yml` file. A `.env` file in the root directory is *required* to specify environment variables of the production containers. The `.env` file should look like the following:

```py
# Required
MYSQL_USER=chemistrycafe
MYSQL_PASSWORD=very_strong_mysqlpassw0rd # Needless to say, do not use this as the actual password
MYSQL_DATABASE=chemistry_db
MYSQL_ROOT_PASSWORD=dontsharethiswithanyonebecausethatwouldbebad
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>
FRONTEND_HOST=https://<domain>
BACKEND_BASE_URL=/api # This would be / if testing on localhost:8080

#Optional with defaults
MYSQL_SERVER=mysql
MYSQL_PORT=3306
```

- **Note**: compared to the development environment, the frontend requires more variables to be specified. This is to ensure less implicit functionality.
- The `FRONTEND_HOST` variable should not have a trailing slash. This is because CORS policies treat `https://<domain>` and `https://<domain>/` as different routes.

#### Frontend variables

The frontend *requires* a file named `.env.production` in its directory. This is because the final container will serve a static site to the user and it pastes the variables inline with the static code.

```py
VITE_BASE_URL=http://localhost:8080/api  # Backend API endpoint
VITE_AUTH_URL=http://localhost:8080/auth # Backend auth endpoint
```

**For Contributors**: Do *not* put secrets in this environment file. These environment variables are served directly to the web browser meaning they are *public*. Any functionality requiring API keys should solely be dealt with in the backend.

- It's very easy to be tempted with an npm package that uses environment variables to call an external API. Many have fallen victim to this security vulnerability in the past.

### To run the production containers:

```
docker compose -f ./docker-compose.production.yml up -d
```

After each container is built and running, the backend will be served in port `8080` and the frontend will be served on port `5173` just like the development environment. 

To actually serve these containers to the world, use a reverse proxy like `NGINX` or `Apache httpd` to redirect traffic to the different services.

When serving on the same dns, it's generaly a good idea to put the frontend on `/` and the backend on something unique like `/api`. Though, if you use `/api`, do note that some routes in the backend may look like `https://<host>/api/api/<route>`.

# License
- [Apache 2.0](/LICENSE)

Copyright (C) 2018-2024 National Center for Atmospheric Research
