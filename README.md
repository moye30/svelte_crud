# Desarrollador
Para correr el proyecto se necesita tener instalado Node.js y npm.
```bash
npm i
npm run dev -- --open
```

## Servidor
Para el servidor se necesitan las dependencias:
```bash
npm init -y
npm install typescript @types/node @types/express @types/sqlite3 @types/bcryptjs ts-node
npm i --save-dev @types/express-session @types/connect-sqlite3

# A lo mejor se necesita correr los siguientes:
npm install ts-node typescript --save-dev
npm install express sqlite3 body-parser bcryptjs express-session connect-sqlite3
npm install nodemailer uuid
```
Y correr el archivo `server.ts`:
```bash
# Ya se ejecuta automagicamente asi:
npm run build
npm start
```
