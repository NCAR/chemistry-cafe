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

### Installing chemistry-cafe locally
1. **Required**:
    To build and install chemisty-cafe locally, you must have:
    - dotnet
    - Node.js
    - Docker

2. **Clone the repository**:
Open a terminal window, navigate to a folder where you would like the Chemistry Cafe files to exist,
and run the following commands:

    ```
    git clone https://github.com/NCAR/chemistry-cafe.git
    cd chemistrycafe
    ```
3. **Install dependencies for frontend**:
    ```shell
    cd frontend
    npm install
    cd ..
    ```
4. **Install dotnet(macOS)**
    ```
    brew install dotnet
    ```

### Running Chemistry Cafe with Docker Compose

You must have [Docker Desktop](https://www.docker.com/get-started) installed and running.
With Docker Desktop running, open a terminal window.
To build the project run:

```
docker compose up --build
```

When finished, run:
```
docker compose down
```
**Note:** To view changes, you must run the docker compose down and then run the project again.

### Running Chemistry Cafe Locally
You must open 3 terminals and run the following commands in each:

**Terminal 1**
```
cd backend
dotnet run
```

**Terminal 2**
```
cd frontend
npm run dev
```

**Terminal 3**
```
docker compose up mysql
```

## Testing

### To test frontend
```
cd frontend
npm run test:coverage
```
If all tests past, the coverage report will generate in frontend/coverage/index.html

### To test backend

**Terminal 1**
```
docker compose up mysql
```
**Terminal 2**
```
cd backend
dotnet test --collect "Code Coverage;Format=cobertura"  --settings ..\.runsettings
```

```
reportgenerator -reports:"TestResults\<guid>\<file-prefix>.cobertura.xml" -targetdir:coveragereport -reporttypes:Html -classfilters:-MySqlConnector.* -filefilters:-/_/src/MySqlConnector/*

```
If all tests past, the coverage report will generate in backend/coveragereport/index.html


# License
- [Apache 2.0](/LICENSE)

Copyright (C) 2018-2024 National Center for Atmospheric Research
