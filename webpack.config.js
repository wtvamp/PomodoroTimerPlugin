const path = require('path');

module.exports = {
  mode: 'production', // or 'development' if you prefer
  entry: './index.js', // Specify the entry point for webpack
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'pomodoro-timer-plugin.js',
    library: {
      name: 'PomodoroTimerPlugin', // Specify the library name
      type: 'umd', // Expose the plugin as UMD
    },
  },
  module: {
    rules: [
      // Add any necessary loaders for your JavaScript files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  externals: {
    // Specify external dependencies that should not be bundled
    'chart.js': {
      commonjs: 'chart.js',
      commonjs2: 'chart.js',
      amd: 'chart.js',
      root: 'Chart', // Provide the global variable name in browser environment
    },
  },
};
