import {EventUtil} from '../util/Util';
import debounce from 'lodash/debounce';
/**
 * windowResize mixins,任何需要监听window resize事件的组件都可以mixins该function
 * @example React.createClass({
 *      mixins:[WindowResizeMixins(function(){//填写resize代码})]
 * });
 * @param resize
 * @returns {{componentDidMount: componentDidMount, componentWillUnmount: componentWillUnmount}}
 * @constructor
 */
var WindowResizeMixins = function (resize) {
    var windowResizeEventListener=new EventUtil(window, this, false);
    windowResizeEventListener.on('resize', debounce(resize, 150));
    this.windowResizeEventListener = windowResizeEventListener;
};
WindowResizeMixins.prototype.dismiss=function () {
    this.windowResizeEventListener.off('resize');
};
module.exports = WindowResizeMixins;
