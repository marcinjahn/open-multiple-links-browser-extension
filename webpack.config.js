const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
   mode: "production",
   entry: {
      content: './src/app/content-scripts/content.ts',
      background: './src/app/background.ts'
   },
   output: {
      path: path.join(__dirname, "./dist"),
      filename: "[name].js",
      clean: true,
   },
   resolve: {
      extensions: [".ts", ".js"],
      plugins: [
         new TsconfigPathsPlugin(),
      ]
   },
   module: {
      rules: [
         {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
         },
      ],
   },
   plugins: [
      new CopyPlugin({
         patterns: [
            "src/manifest.json",
            { from: "assets/icons/*", to: "assets/icons/[name][ext]" }
         ]
      }),
   ],
   experiments: {
      topLevelAwait: true
   }
};