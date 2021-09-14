const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


const base = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      // ts-loader
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ],
  },
  optimization: {
    minimize: true
  }
};


const tempConfig = process.env.NODE_ENV === 'production' ? {
    ...base,
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'laputarednerer',
        libraryTarget: 'umd'
    },
    plugins: [
        new CleanWebpackPlugin()  // clear output dict before compiling
    ]
} : {
    ...base,
    entry: path.join(__dirname, 'example/demo.tsx'),
    output: {
        path: path.join(__dirname, 'example/dist'),
        filename: 'bundle.js',
        library: 'laputarenderer',
        libraryTarget: 'umd'
    },
    plugins: []
};

module.exports = tempConfig;
