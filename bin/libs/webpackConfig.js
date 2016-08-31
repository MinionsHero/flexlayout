var moduleConfig = {
    module: {
        noParse: [],
        loaders:[
            {
                test:/\.css$/,
                loader:'style-loader!css-loader'
            },
            {
                test:/\.jsx?$/,
                loader:'babel-loader',
                exclude: /node_modules/,
                query:{
                    plugins: ['lodash'],
                    presets:['es2015','react']
                }
            },
            {
                test:/\.json/,
                loader:'json-loader'
            },
            {
                test:/\.(png|jpg|gif)$/,
                loader:'url-loader?limit=8192&name=img/[hash:8].[name].[ext]'
            },
            {
                test:/\.less$/,
                loader:'style-loader!css-loader!less-loader'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&minetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg|mp4|swf|gif|webm|ogv)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            },
        ],
    },
};

module.exports={
    moduleConfig:moduleConfig
}