module.exports = {
    getComputedStyle: function (elem, prop, pseudo) {
        var pseudo = pseudo ? pseudo : null;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(elem, pseudo)[prop];
        }else if(window.getComputedStyle){
            return window.getComputedStyle(elem,pseudo)[prop];
        } else if (elem.currentStyle) {
            return elem.currentStyle[prop];
        }
        return null;
    },
    offsetWidth:function (elem) {
        return elem.offsetWidth;
    },
    offsetHeight:function (elem) {
        return elem.offsetHeight;
    },
    cssNumberValue:function (elem,prop) {
        var value=this.getComputedStyle(elem,prop,null);
        var numberValue=Number(value);
        if(isNaN(numberValue)){
            console.error('It is not number value');
        }else{
            return numberValue;
        }
    },
    isSupportFlex:function () {
        if(this.supportFlex==undefined){
            if(
                'flexDirection' in document.documentElement.style&&
                'flexWrap' in document.documentElement.style&&
                'justifyContent' in document.documentElement.style&&
                'alignItems' in document.documentElement.style&&
                'alignContent' in document.documentElement.style){
                this.supportFlex=true;
            }else{
                this.supportFlex=false;
            };
        }
        return this.supportFlex;
    },
};
