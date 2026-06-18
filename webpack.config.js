// const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
// const path = require("path");

// module.exports = {
//   output: {
//     uniqueName: "angularApp",
//     publicPath: "http://localhost:4200/",
//     path: path.resolve(__dirname, "dist"),
//   },
//   plugins: [
//     new ModuleFederationPlugin({
//       remotes: {
//         reactApp: "reactApp@http://localhost:3000/remoteEntry.js",
//       },
//       shared: {
//         "@angular/core": { singleton: true, strictVersion: true },
//         "@angular/common": { singleton: true, strictVersion: true },
//         "@angular/router": { singleton: true, strictVersion: true },
//       },
//     }),
//   ],
// };

