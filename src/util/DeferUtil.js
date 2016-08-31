import forEach from 'lodash/forEach';
import $ from 'jquery';
module.exports = {
    /**
     * 延迟container计算尺寸
     * @param container
     * @param calcSizeFunc
     */
    deferCalcSize:function (container,calcSizeFunc) {
        var objectArray=$(container).find('img,video,object');
        var defer=[];
        forEach(objectArray,function (obj, index) {
            var deferLoad=$.Deferred();
            defer.push(deferLoad);
            $(obj).on('load',function () {
                deferLoad.resolve();
            });
        });
        $.when(...defer).done(calcSizeFunc);
    }
};
