module.exports = {
  // ... other configurations ...
  devtool: "source-map",
  module: {
    rules: [
      // ... other rules ...
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
        exclude: /face-api\.js/,
      },
    ],
  },
};
