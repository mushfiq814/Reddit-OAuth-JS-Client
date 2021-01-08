const path = require('path');

module.exports = [
  {
    name: 'development',
    mode: 'development',
    entry: './src/main.ts',
    module: {
      rules: [
        {
          // use ts-loader for all .ts files in /src/
          test: /\.ts$/,
          use: 'ts-loader',
          include: [path.resolve(__dirname, 'src')]
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    }
  },
  {
    name: 'production',
    mode: 'production',
    entry: './src/main.ts',
    module: {
      rules: [
        {
          // use ts-loader for all .ts files in /src/
          test: /\.ts$/,
          use: 'ts-loader',
          include: [path.resolve(__dirname, 'src')]
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    }
  },
];
