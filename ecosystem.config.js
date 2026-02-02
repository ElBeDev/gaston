module.exports = {
  apps: [
    {
      name: 'gaston-backend',
      script: './backend/src/app-simple.js',
      cwd: '/root/GastonAssistan',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/gaston-assistant/backend-error.log',
      out_file: '/var/log/gaston-assistant/backend-out.log',
      log_file: '/var/log/gaston-assistant/backend-combined.log',
      time: true
    },
    {
      name: 'gaston-frontend',
      script: 'npx',
      args: 'serve -s build -l 3001',
      cwd: '/root/GastonAssistan/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/gaston-assistant/frontend-error.log',
      out_file: '/var/log/gaston-assistant/frontend-out.log',
      log_file: '/var/log/gaston-assistant/frontend-combined.log',
      time: true
    }
  ]
};
