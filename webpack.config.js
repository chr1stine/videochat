const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/index.js",
    output:{
        path: path.resolve(__dirname,'deploy/dist'),
        filename: "bundle.js"
    },
    devtool: 'source-map',
    module:{
        rules:[
            {
                test:/\.m?js$/,
                exclude: /node_modules/,
                loader:'babel-loader',
                options:{
                    presets: ['@babel/preset-env','@babel/preset-react']
                }
            },
            {
                test: /\.(woff|woff2)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'url-loader',
                },
            },
            {
                test: /\.(less|css)/,
                use:['style-loader','css-loader','less-loader']
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}