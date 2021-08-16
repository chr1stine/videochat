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
                test:/\.js/,
                loader:'babel-loader',
                options:{
                    presets: ['@babel/preset-env','@babel/preset-react']
                }
            },
            {
                test: /\.less/,
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