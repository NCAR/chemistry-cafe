Chemistry Cafe API
==============

API for the Chemistry Cafe web application found here https://github.com/NCAR/chemistrycafe


# Getting Started

## Google Cloud

In order to use Google Authentication, a Google Cloud OAuth 2.0 project must be used for testing. When creating the project, `http://localhost:8080/signin-google` should be added to the list of Authorized redirect URIs.

## Environment Variables

For the backend to connect to the MySQL server, certain environment variables must be specified. The default values can be seen in `docker-compose.yml`. These variables are the following:

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

`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` can be found in a google cloud project. These variables may be set in a `.env` file in the `/backend` directory or created on the machine itself.

## Command line

Install the `dotnet` tool

### macOS

```
brew install dotnet
```

---

Then build the project

```
dotnet run
```

This should start a server. You should be able to access a swagger page on the port that the server stars, for example [http://localhost:8080/swagger](http://localhost:8080)

## Installing the API locally
To build and install Chemistry Cafe locally, you must have Visual Studio 2022.

Simply clone the project then open the .sln file in Visual Studio.

To change the locaiton of the web application, navigate to the Progran.cs folder then change the IP address on line 22.

To change the database location, navigate to the appsetting.json and change the Default Connection String on line 10.

# Database
The database that the API is meant to call was made in MySQL. A script to create all the tables can be found in the file chemistry-cafe-database.sql.

# Using the MICM API

When ran in development mode the API launches a Swagger page with all the routes and the various inputes and outputs.

Most routes take in JSON as outputs and give responses as JSON.

# File Structure
This API was written using Controller, Service, Model methodology. The controllers route the incoming traffic and replies using the functions within services which actually do the logic. The models are the various entities in the database.

# License

- [Apache 2.0](/LICENSE)

Copyright (C) 2018-2024 National Center for Atmospheric Research
