import React from 'react';
import omit from 'lodash/omit';
import keys from 'lodash/keys';
module.exports = {
    getOrInitProps:function (reactComponent) {
        return reactComponent.props?reactComponent.props:{}
    },
    getOrInitStyle:function (reactComponent) {
        var props=this.getOrInitProps(reactComponent);
        return props.style?props.style:{};
    },
    getOrInitStyleCssValue:function (reactComponent,cssProp) {
        var style=this.getOrInitStyle(reactComponent);
        return style[cssProp]?style[cssProp]:undefined;
    },
    getPureProps:function (reactComponent) {
        return omit(this.getOrInitProps(reactComponent),keys(reactComponent.constructor.propTypes));
    },
    /**
     * 类似React.cloneElement,但允许props和children为undefined,如果children==undefined同时element.props.children存在，默认使用element的的children
     * @param element
     * @param props
     * @param children
     * @returns {ReactElement<P>|CElement<P, T>|SFCElement<P>|DOMElement<P, T>}
     */
    cloneElement:function (element,props,children) {
        var params=[];
        params.push(element);
        if(props){
            params.push(props);
        }else{
            params.push({});
        }
        if(children){
            params.push(children);
        }else if(element.props&&element.props.children){
            params.push(element.props.children)
        }
        return React.cloneElement(...params);
    }
};
