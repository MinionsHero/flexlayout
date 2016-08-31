'use strict';
import React from 'react';
import classSet from 'classnames';
import ReactUtil from '../../../src/util/ReactUtil';
//需要引入../fonts文件夹下地所有fontAwesome字体文件
require('!url!./fonts/fontawesome-webfont.woff');
require('!url!./fonts/fontawesome-webfont.woff2');
require('!file!./fonts/fontawesome-webfont.eot');
require('!file!./fonts/fontawesome-webfont.svg');
require('!file!./fonts/fontawesome-webfont.ttf');
require('!style!css!./css/font-awesome.min.css');
/**
 * @description 图标
 * @type {ClassicComponentClass<P>}
 * @property {number|string} size 图标大小
 * @property {string} href 可选,链接
 * @property {ClassicComponentClass<P>} component 可选,需要转换的响应的HTML元素
 * @property {string} icon 图标名称,参考<a href="http://fontawesome.io/icons/">FontAwesome</a>,如fa-phone,这里的icon就是phone.
 */
var Icon = React.createClass({
    displayName: 'Icon',
    propTypes: {
        size: React.PropTypes.string,
        href: React.PropTypes.string,
        component: React.PropTypes.node.isRequired,
        icon: React.PropTypes.string.isRequired
    },

    getDefaultProps: function getDefaultProps() {
        return {
            component: 'span',
            size:'16px'
        };
    },

    render: function render() {
        var props = this.props;
        var classes={};
        classes['fa']=true;
        classes['fa-'+props.icon]=true;
        var component = props.href ? 'a' : props.component;
        var style=ReactUtil.getOrInitStyle(this);
        style.fontSize=props.size;
        var iconProps=ReactUtil.getPureProps(this);
        iconProps.className=classSet(classes,props.className);
        iconProps.style=style;
        if(props.href){
            iconProps.href=props.href;
        }
        return React.createElement(
            component,
            iconProps
        );
    }
});

module.exports = Icon;