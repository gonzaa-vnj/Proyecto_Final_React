# Imagen base de Node.js
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto del servidor (ajuste si su server.js usa otro)
EXPOSE 3000

# Comando para ejecutar la app
CMD ["node", "server.js"]
