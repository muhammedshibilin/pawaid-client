module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)$/,
        type: 'asset/resource', 
      },
    ],
  },
};
