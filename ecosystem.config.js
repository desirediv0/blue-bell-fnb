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
      script: "node",
      args: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3003
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
      args: "run preview",
      env: {
        NODE_ENV: "production",
        PORT: 4175
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      error_file: "/root/.pm2/logs/bluebell-admin-error.log",
      out_file: "/root/.pm2/logs/bluebell-admin-out.log",
      log_date_format: "DD/MM/YYYY HH:mm:ss"
    }
    // {
    //   name: "bluebell-partner",
    //   cwd: "./partner",
    //   script: "npm",
    //   args: "run preview",
    //   env: {
    //     NODE_ENV: "production",
    //     PORT: 5001
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
