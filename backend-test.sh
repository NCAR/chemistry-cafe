#!/bin/sh

docker compose up mysql -d
dotnet test backend --collect:"Code Coverage;Format=cobertura"
docker compose down
