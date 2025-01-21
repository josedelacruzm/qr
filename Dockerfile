# Etapa 1: Build del frontend
FROM node:20 AS frontend-builder
WORKDIR /reactapp1.client
COPY /reactapp1.client/package*.json ./
RUN npm install
COPY /reactapp1.client .
RUN npm run build

# Etapa 2: Build del backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend
WORKDIR /app
COPY ReactApp1.Server/*.csproj ./
RUN dotnet restore
COPY ReactApp1.Server/ .
# Modificamos esta línea para usar la ruta correcta
COPY --from=frontend-builder /reactapp1.client/dist /app/wwwroot
RUN dotnet publish -c Release -o out

# Etapa final: Imagen de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend /app/out ./

# Agregar estas variables de entorno
ENV ASPNETCORE_URLS=http://+:8080
ENV PORT=8080

EXPOSE ${PORT}
ENTRYPOINT ["dotnet", "ReactApp1.Server.dll"]