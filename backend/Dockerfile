#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base

COPY . ChemistryCafeBackend/
WORKDIR /ChemistryCafeBackend

EXPOSE 8080
EXPOSE 8081

FROM base AS build

WORKDIR /ChemistryCafeBackend
RUN dotnet restore "./ChemistryCafeAPI.csproj"
RUN dotnet build "./ChemistryCafeAPI.csproj" -c Release -o /app/build

FROM build AS publish

WORKDIR /ChemistryCafeBackend
RUN dotnet publish "./ChemistryCafeAPI.csproj" -c Release -o /app/publish --self-contained -r linux-x64

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final

WORKDIR /ChemistryCafeBackend
COPY --from=publish /app/publish .

# Default published binary port
EXPOSE 5000
USER app

# Default command for production
ENTRYPOINT ["./ChemistryCafeAPI"]
