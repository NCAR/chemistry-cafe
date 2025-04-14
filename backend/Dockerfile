#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS base

COPY . ChemistryCafeBackend/
WORKDIR /ChemistryCafeBackend

EXPOSE 8080
EXPOSE 8081

FROM base AS build

ARG BUILD_CONFIGURATION=Release
ARG BUILD_ARCH=linux-x64

WORKDIR /ChemistryCafeBackend
RUN dotnet restore "./ChemistryCafeAPI.csproj"
RUN dotnet build "./ChemistryCafeAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish

WORKDIR /ChemistryCafeBackend
RUN dotnet publish "./ChemistryCafeAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish --self-contained -r $BUILD_ARCH

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS final

WORKDIR /ChemistryCafeBackend
COPY --from=publish /app/publish .

# Default published binary port
EXPOSE 5000
USER app

# Default command for production
ENTRYPOINT ["./ChemistryCafeAPI"]
