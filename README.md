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
GOOGLE_CALLBACK_PATH=/signin-google
MYSQL_SERVER=localhost
MYSQL_PORT=3306
```

In order to use Google Authentication, a Google Cloud OAuth 2.0 project must be used with a `client id` and `client secret`. When creating the project, `http://localhost:8080/signin-google` should be added to the list of "Authorized redirect URIs" for testing.

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
reportgenerator -reports:"backend\TestResults\**\**.cobertura.xml" -targetdir:coveragereport -reporttypes:Html,lcov -classfilters:-MySqlConnector.* -filefilters:-/_/src/MySqlConnector/*,-backend\TestResults\**\coverage.cobertura.xml; rmdir -r .\backend\TestResults
```

If all tests past, the coverage reports will generate in backend/coveragereport/index.html and backend/coveragereport/lcov.info


# License
- [Apache 2.0](/LICENSE)

Copyright (C) 2018-2024 National Center for Atmospheric Research
