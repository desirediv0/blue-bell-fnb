module.exports = {
  apps: [
    {
      name: "bluebell-server",
      cwd: "./server",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4002
      },
      env_production: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      error_file: "/root/.pm2/logs/bluebell-server-error.log",
      out_file: "/root/.pm2/logs/bluebell-server-out.log",
      log_date_format: "DD/MM/YYYY HH:mm:ss"
    },
    {
      name: "bluebell-client",
      cwd: "./client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      },
      env_production: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "800M",
      error_file: "/root/.pm2/logs/bluebell-client-error.log",
      out_file: "/root/.pm2/logs/bluebell-client-out.log",
      log_date_format: "DD/MM/YYYY HH:mm:ss"
    },
    {
      name: "bluebell-admin",
      cwd: "./front",
      script: "npm",
      args: "run preview -- --port 4174 --host 0.0.0.0",
      env: {
        NODE_ENV: "production",
        PORT: 4174
      },
      env_production: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      error_file: "/root/.pm2/logs/bluebell-admin-error.log",
      out_file: "/root/.pm2/logs/bluebell-admin-out.log",
      log_date_format: "DD/MM/YYYY HH:mm:ss"
    },
    // {
    //   name: "bluebell-partner",
    //   cwd: "./partner",
    //   script: "npm",
    //   args: "run preview -- --port 5001 --host 0.0.0.0",
    //   env: {
    //     NODE_ENV: "production",
    //     PORT: 5001
    //   },
    //   env_production: {
    //     NODE_ENV: "production"
    //   },
    //   instances: 1,
    //   exec_mode: "fork",
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: "500M",
    //   error_file: "/root/.pm2/logs/bluebell-partner-error.log",
    //   out_file: "/root/.pm2/logs/bluebell-partner-out.log",
    //   log_date_format: "DD/MM/YYYY HH:mm:ss"
    // }
  ]
};
