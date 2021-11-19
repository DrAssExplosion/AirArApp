const path = require('path');
require("@babel/polyfill");

module.exports = {
    mode: 'development',
    entry: ["@babel/polyfill", "./src/scripts/index.js"],
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};