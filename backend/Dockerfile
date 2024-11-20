#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final

ARG BUILD_CONFIGURATION=Release

COPY . ChemistryCafeBackend/
WORKDIR /ChemistryCafeBackend

RUN dotnet restore "./ChemistryCafeAPI.csproj"
RUN dotnet build "./ChemistryCafeAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build
RUN dotnet publish "./ChemistryCafeAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish --self-contained -r linux-x64

WORKDIR /app/build

USER app
EXPOSE 8080
EXPOSE 8081

# Default command for production
ENTRYPOINT ["./ChemistryCafeAPI"]
