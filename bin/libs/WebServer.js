var webpackConfig=require('./webpackConfig');
var Webpack=require('webpack');
var WebpackDevServer =require('webpack-dev-server');
var HtmlWebpackPlugin = require('html-webpack-plugin');//自动生成HTML
var WebpackBrowserPlugin = require('webpack-browser-plugin');
var _ = require('lodash');
var os = require('os');
var path = require('path');
/**
 * 获取当前电脑的IP
 * @returns {string}
 */
var getIp=function () {
    var ip='localhost';
    //获取当前的广域网地址
    var network=os.networkInterfaces();
    _.forEach(_.keys(network),function (key) {
        var filterIpv4=_.find(network[key],function (netInterface) {
            switch(key){
                //广域网接口
                case 'eth0':
                case 'en0':
                case 'wifi0':
                    if(netInterface.family.toLowerCase()=="ipv4"&&!netInterface.internal){
                        return ip=netInterface.address;
                    }
                    break;
                //localhost
                case 'lo0':
                default:
                    ip=netInterface.address;
                    break;
            }
        });
        return filterIpv4==undefined;//搜寻到了ipv4,将会退出循环。
    });
    return ip;
};

/**
 * 创建服务器
 * @param [object] config ,需要包含serverName服务名称,port监听端口,entries入口文件路径或路径数组,contentBase监听的目录
 * @constructor
 */
var WebServer=function (serverConfig) {
    if(serverConfig.port==undefined){
        new Error('port error');
    }
    if(!serverConfig.entries){
        new Error('entries error');
    }
    if(!serverConfig.contentBase){
        new Error('contentBase error');
    }
    const IP=getIp();
    var config=Object.assign({},webpackConfig.moduleConfig,{
        entry:{
            index: _.concat([
                "webpack-dev-server/client?http://"+IP+":"+serverConfig.port+"/",
                "webpack/hot/dev-server"
            ],serverConfig.entries),
        },
        output:{
            filename:'bundle.js',
            path:serverConfig.contentBase
        },
        contentBase: serverConfig.contentBase,
        watchOptions:{
            aggregateTimeout:300,
            poll:true
        },
        proxy: {
            "./": {
                target: {
                    "host": IP,
                    "protocol": 'http:',
                    "port": serverConfig.port
                },
                ignorePath: true,
                changeOrigin: true,
                secure: false
            }
        },
        stats:{
            colors:true,
        },
        historyApiFallback: true,
        plugins:[
            new Webpack.ProgressPlugin(function handler(percentage, msg) {
                console.log(serverConfig.serverName+'的编译进度:'+percentage*100 +'%',msg);
            }),
            new Webpack.HotModuleReplacementPlugin,
            new HtmlWebpackPlugin({
                filename:'index.html',
                inject:'body',
                showErrors:true,
                chunks:'app',
                template: path.resolve('./bin/libs/index.ejs'),
            }),
            new WebpackBrowserPlugin({
                browser: 'google chrome',//webpack-dev-server will open default browser.
                port:serverConfig.port,
                url: 'http://'+IP
            }),
        ]
    });
    var compiler = Webpack(config);
    this.server = new WebpackDevServer(compiler,config);
    this.ip=IP;
    this.port=serverConfig.port;
};
/**
 * 启动监听
 * @param callback 启动开始的回调
 */
WebServer.prototype.listen=function (callback) {
    this.server.listen(this.port,this.ip,callback);
}

module.exports=WebServer;