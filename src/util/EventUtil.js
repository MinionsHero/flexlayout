const EventUtil = function (elem, context=this, isBubble=false) {
    this.elem=elem;
    this.isBubble=isBubble;
    this.context=context;
};
EventUtil.prototype.on=function (type,handler) {
    this.off(type);
    var context=this.context;
    var eventHandler=function (e) {
        // var event={};
        // event.target=e.target||e.srcElement;
        // event.preventDefault=function () {
        //     if(e.preventDefault){
        //         e.preventDefault();
        //     }else{
        //         e.returnValue=false;
        //     }
        // };
        // event.stopPropagation=function () {
        //     if(e.stopPropagation){
        //         e.stopPropagation();
        //     }else{
        //         e.cancelBubble=true;
        //     }
        // };
        // if(type=='keypress'){
        //     event.keyCode=(typeof e.charCode=='number'?e.charCode:e.keyCode);
        // }else if(type=='keydown'){
        //     event.keyCode=e.keyCode;
        // }
        handler.call(context,e);
    }
    if(this.elem.addEventListener){
        this.elem.addEventListener(type,eventHandler,this.isBubble);
    }else if(this.elem.attachEvent){
        this.elem.attachEvent('on'+type,eventHandler);
    }else {
        this.elem['on'+type]=eventHandler;
    }
    this[type]=eventHandler;
};
EventUtil.prototype.off=function (type) {
    if(this[type]){
        if(this.elem.removeEventListener){
            this.elem.removeEventListener(type,this[type],this.isBubble);
        }else if(this.elem.detachEvent){
            this.elem.detachEvent('on'+type,this[type]);
        }else {
            this.elem['on'+type]=null;
        }
    }
};
module.exports = EventUtil;
