# Guía de Despliegue - Sistema de Soporte IT

## ⚠️ IMPORTANTE: Este proyecto es Node.js, NO PHP

Este proyecto **NO debe** colocarse en la carpeta `htdocs` de XAMPP. XAMPP solo puede servir archivos PHP/HTML estáticos, no puede ejecutar aplicaciones Node.js.

---

## Requisitos Previos

1. **Node.js** instalado (versión 18+ recomendada)
2. **MySQL** o **MariaDB** instalado y corriendo
3. **PM2** instalado globalmente (opcional pero recomendado)

---

## Opción 1: Despliegue Directo (Recomendado)

Esta es la forma más limpia. Node.js corre directamente en el puerto 3000.

### Pasos:

1. **Instalar dependencias:**
   ```bash
   cd C:\ruta\al\proyecto
   npm install
   ```

2. **Crear archivo `.env`:**
   ```
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=production
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_password_mysql
   DB_NAME=soporteit
   SESSION_SECRET=una_cadena_segura_aleatoria
   BASE_PATH=
   ```

3. **Crear la base de datos:**
   ```bash
   mysql -u root -p < soporteit.sql
   ```

4. **Iniciar el servidor:**
   ```bash
   npm start
   ```

5. **Acceder a:** `http://10.11.73.252:3000`

---

## Opción 2: Despliegue con Proxy Inverso (usando XAMPP)

Si necesitas mantener la aplicación accesible desde `/SOPORTEIT/` con Apache como frontend.

### Pasos:

1. **Instalar dependencias (igual que arriba)**

2. **Crear archivo `.env` CON BASE_PATH:**
   ```
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=production
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_password_mysql
   DB_NAME=soporteit
   SESSION_SECRET=una_cadena_segura_aleatoria
   BASE_PATH=/SOPORTEIT
   ```

3. **Configurar el proxy inverso en Apache:**

   Edita `C:\xampp\apache\conf\httpd.conf` y agrega al final:
   ```apache
   # Proxy para SoporteIT Node.js
   ProxyPass /SOPORTEIT/ http://localhost:3000/
   ProxyPassReverse /SOPORTEIT/ http://localhost:3000/
   ```

4. **Reinicia Apache desde XAMPP Control Panel**

5. **Crear la base de datos:**
   ```bash
   mysql -u root -p < soporteit.sql
   ```

6. **Iniciar Node.js:**
   ```bash
   npm start
   ```

7. **Acceder a:** `http://10.11.73.252/SOPORTEIT/` (¡Con la barra al final!)

---

## Credenciales por Defecto

| Usuario | Contraseña |
|---------|------------|
| admin | admin |

---

## Solución de Problemas

### Error 404 después de hacer login

1. Si usas proxy inverso, **asegúrate de que `.env` tenga `BASE_PATH=/SOPORTEIT`**
2. Reinicia Node.js después de cambiar `.env` (Ctrl+C y `npm start`)
3. Verifica que la base de datos tenga usuarios:
   ```sql
   mysql -u root -p soporteit -e "SELECT * FROM usuarios;"
   ```

### CSS no carga

1. Verifica que `BASE_PATH` esté configurado correctamente
2. Verifica en las herramientas de desarrollador del navegador (F12) que el CSS se carga desde la URL correcta

### MySQL no conecta

1. Verifica que MySQL esté corriendo
2. Verifica las credenciales en `.env`
3. Prueba la conexión:
   ```bash
   mysql -u root -p -e "SELECT 1"
   ```

---

## Estructura del Proyecto

```
soporteit/
├── src/
│   ├── app.js              # Punto de entrada principal
│   ├── config/
│   │   └── db.js           # Configuración de base de datos
│   ├── middlewares/
│   │   ├── auth.js         # Middleware de autenticación
│   │   └── authz.js        # Middleware de autorización
│   ├── public/
│   │   ├── css/            # Archivos CSS compilados
│   │   ├── img/            # Imágenes
│   │   └── scss/           # Archivos SASS (fuente)
│   ├── routes/
│   │   ├── auth.js         # Rutas de autenticación
│   │   ├── menu.js         # Rutas del menú principal
│   │   └── tickets.js      # Rutas de tickets
│   ├── uploads/            # Archivos subidos por usuarios
│   └── views/              # Plantillas EJS
├── soporteit.sql           # Estructura de la base de datos
├── package.json
├── ecosystem.config.js     # Configuración para PM2
└── .env                    # Variables de entorno (crear)
```
