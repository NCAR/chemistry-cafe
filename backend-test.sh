#!/bin/sh

docker compose up mysql -d
dotnet test backend --collect:"Code Coverage;Format=cobertura" --settings backend/.runsettings
docker compose down
