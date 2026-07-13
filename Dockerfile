# Utilizar una imagen base oficial de Node.js (versión LTS ligera)
FROM node:20-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias de producción únicamente
RUN npm install --omit=dev

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto solicitado por el usuario (3001)
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
