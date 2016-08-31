const path = require('path');
const WebServer=require('./libs/WebServer');
var webserver = new WebServer({
    serverName:'测试FlexLayout',
    port:'8082',
    entries:path.resolve('./test/FlexLayoutTest'),
    contentBase:path.resolve('./bin')
});
webserver.listen(function () {
    console.log('开始测试代码,一会将自动打开浏览器');
})