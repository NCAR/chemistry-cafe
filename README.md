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

### Backend Environment Variables

The backend of Chemistry Cafe requires certain secrets that cannot be stored in version control. These secrets are stored in environment variables that are either on the machine or loaded on runtime. Before running the application, make sure to define these variables ahead of time.

To define required environment variables, a `.env` file should be created with the following schema:

```py
# Required
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>
MYSQL_USER=chemistrycafedev
MYSQL_PASSWORD=chemistrycafe
MYSQL_DATABASE=chemistry_db

# Optional with defaults
MYSQL_SERVER=localhost
MYSQL_PORT=3306
FRONTEND_HOST=http://localhost:5173
BACKEND_BASE_URL=/
```

In order to use Google Authentication, a Google Cloud OAuth 2.0 project must be used with a `client id` and `client secret`. When creating the project, `http://localhost:8080/signin-google` should be added to the list of "Authorized redirect URIs" for testing.

`FRONTEND_HOST` and `BACKEND_BASE_URL` are required in a production environment. `FRONTEND_HOST` contains where the frontend is served and `BACKEND_BASE_URL` specifies what the backend urls should be prefixed with (eg. "/api/").

**Note:**

- When running locally, the `.env` file must be in the `/backend` directory. 
- When running with docker, the `.env` file can either be in the root directory *or* `/backend`. If it is in another directory, simply use `docker compose --env-file <path/to/.env> up` instead of the default.  

### Running Chemistry Cafe with Docker Compose

You must have [Docker Desktop](https://www.docker.com/get-started) installed and running.
With Docker Desktop running, open a terminal window.
To build the project run:

```
docker compose up --build
```

To run project in background:

```
docker compose up -d
```

When finished, run:
```
docker compose down
```

To view logs for backend/frontend/sql:
```
docker compose logs backend
docker compose logs frontend 
docker compose logs sql 
```

To view logs for all services:
```
docker compose logs -f 
```

**Note:** To view changes, you must run the docker compose down and then run the project again.

### Local Development (without Docker)

#### Framework dependencies

- [dotnet](https://dotnet.microsoft.com/en-us/download) (backend)
- [Node.js](https://nodejs.org/en/download) (frontend)
- [Docker](https://www.docker.com/) (optional but makes things easier)

#### Setup
1. **Clone the repository**:
Open a terminal window, navigate to a folder where you would like the Chemistry Cafe files to exist,
and run the following commands:

    ```
    git clone https://github.com/NCAR/chemistry-cafe.git
    cd chemistrycafe
    ```
2. **Install dependencies for frontend**:
    ```shell
    cd frontend
    npm install
    cd ..
    ```
4. **Install dependencies for backend**
    ```
    cd backend
    dotnet restore
    ```

## Testing

### To test frontend
```
cd frontend
npm run test:coverage
```
If all tests past, the coverage report will generate in frontend/coverage/index.html

### To test backend

```
docker compose up mysql -d
dotnet test backend --collect:"Code Coverage;Format=cobertura" --settings backend/.runsettings
docker compose down
```

```
<<<<<<< Updated upstream
reportgenerator -reports:"backend/TestResults/**/**.cobertura.xml" -targetdir:coveragereport -reporttypes:Html,lcov -classfilters:-MySqlConnector.* -filefilters:-/_/src/MySqlConnector/*,-backend/TestResults/**/coverage.cobertura.xml; rm -r ./backend/TestResults
=======
reportgenerator -reports:"TestResults\<guid>\<file-prefix>.cobertura.xml" -targetdir:coveragereport -reporttypes:Html,lcov -classfilters:-MySqlConnector.* -filefilters:-/_/src/MySqlConnector/*

>>>>>>> Stashed changes
```

If all tests run, the coverage report will generate index.html and lcov.info under backend/coveragereport/.


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

The frontend requires a file named `.env.production` in its directory. This is because the final container will serve a static site to the user and it pulls the variables from this file instead

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

To actually serve these containers to the world, 

# License
- [Apache 2.0](/LICENSE)

Copyright (C) 2018-2024 National Center for Atmospheric Research
