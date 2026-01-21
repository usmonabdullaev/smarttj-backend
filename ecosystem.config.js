module.exports = {
  apps: [
    {
      name: 'smarttj-backend',
      script: 'npm',
      args: 'run start:prod',
      interpreter: 'none',

      env_production: {
        NODE_ENV: 'production',
      },

      error_file: './logs/error.log',
      out_file: './logs/out.log',
    },
  ],
};
