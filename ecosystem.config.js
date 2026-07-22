module.exports = {
  apps: [
    {
      name: "SoporteIT",
      script: "src/app.js",
      cwd: "C:/Users/lopez/Desktop/ProyectoSistemaSoporteIT",
      instances: 1,           // o "max"
      exec_mode: "fork",      // o "cluster"
      watch: false,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        DB_HOST: process.env.DB_HOST || "127.0.0.1",
        DB_PORT: process.env.DB_PORT || 3306,
        DB_USER: process.env.DB_USER || "root",
        DB_PASSWORD: process.env.DB_PASSWORD || "",
        DB_NAME: process.env.DB_NAME || "soporteit"
      },
      out_file: "C:/pm2/logs/SoporteIT-out.log",
      error_file: "C:/pm2/logs/SoporteIT-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
