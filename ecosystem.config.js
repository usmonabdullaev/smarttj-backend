module.exports = {
  apps: [
    {
      name: 'smarttj-backend',
      script: 'dist/main.js',
      cwd: __dirname,

      exec_mode: 'fork',
      instances: 1,

      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      error_file: './logs/error.log',
      out_file: './logs/out.log',
    },
  ],
};
