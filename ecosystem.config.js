module.exports = {
  apps: [
    {
      name: 'alquileres-backend',
      script: 'npm run start',
      cwd: './server',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
  ]
};
