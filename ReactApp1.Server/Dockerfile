# Dockerfile en el servidor ASP.NET
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . .

# Remove any COPY line that attempts to copy from build to wwwroot
