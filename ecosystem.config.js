module.exports = {
  apps: [
    {
      name: "SoporteIT",
      script: "src/app.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0"
      },
      out_file: "./logs/SoporteIT-out.log",
      error_file: "./logs/SoporteIT-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
