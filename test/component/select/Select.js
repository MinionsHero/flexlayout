import React from 'react';
import ReactDOM from 'react-dom';
import ClassNames from 'classnames';
import $ from 'jquery';
import {ReactUtil,EventUtil} from '../../../lib/util/Util';
import Icon from '../../component/icon/Icon';
import {defaults,indexOf,forEach} from 'lodash';
import Lang from './Lang.json';
require('./select.less');
var prefix="select";
/**
 * @description 替代表单组件select(包含option/optgroup)的选择器组件，该组件提供最大的便利允许进行简单的json数据绑定，来显示选项数据， 设置数据绑定需要使用options字段，格式如下所示。
 * [option,option,option,option]
 *    option可以是一个字符串，或者一个包含label或者name字段以及value字段的对象，其中label和name的作用一样，该字段用于显示展示给用户的文字；
 *    每一个option也可以包含一个options字段(此时value字段将失效)，这种情况下该option就会被渲染成optgroup的效果，该组件支持多个optgroup的嵌套。
 *    option同时支持selected（仅用于不包含options字段的option）和disabled字段，前者表示当前select默认选中的option是当前option，后者表示禁用此option，父级的disabled属性会覆盖子级
 *   下面是一个例子：
 *   [{
 *       label: '业余课程',
 *        options: [{name: '美术', value: 'art'}, {label: '体育', value: 'sports', selected: true}, {
 *            label: '其他',
 *            options: ['思想品德', '法律']
 *   }]
 * @type {ClassicComponentClass<P>}
 * @property {string|ClassicComponentClass} lang 当前语言环境，默认跟随浏览器的语言
 * @property {array} options（必须） 提供的options选项，其格式如下
 * @property {string} name select对应的键值，用于提交服务器的表单数据标识
 * @property {object} bundleData 该对象存储select的键值数据，每一次select值得改变都会映射到这里，因此只需要赋值一个空对象即可
 * @property {string} placeholder 提示用户的一段话
 * @property {function} onOptionSelect 每一次表单的select操作产生的回调，第一次渲染完成默认不会调用此回调，function(value,label)
 * @example
 * 使用Demo可参考目录test/select/SelectTest
 */
var Select = React.createClass({
    displayName: 'Select',
    propTypes:{
        lang:React.PropTypes.string,
        options:React.PropTypes.array.isRequired,
        name:React.PropTypes.string.isRequired,
        bundleData:React.PropTypes.object,
        placeholder:React.PropTypes.string,
        onOptionSelect:React.PropTypes.func//function(value,label)
    },
    getDefaultProps:function () {
        return {
            lang:"zh"
        }
    },
    getLabel:function (obj) {
      return  obj.label?obj.label:(obj.name?obj.name:obj.value);
    },
    recurseChildren:function (options,selected,curParentIsDisabled) {
        var context=this;
        var children=[];
        //['','','']||[{options:[{value:'',label:''}]}]||[{value:'',label:''},{value:'',label:''}]
        if(options instanceof Array){
            forEach(options,function (child, index) {
                var disabled=curParentIsDisabled||child.disabled
                if((typeof child).toLowerCase()=='string'){
                    //最简单的options，label=value
                    //先进行默认赋值
                    if((selected.defaultValue==undefined)&&!disabled){
                        selected.defaultValue=child;
                        selected.defaultLabel=child;
                    }
                    children.push(React.createElement(
                        'div',
                        {
                            'data-label':child,
                            'data-value':child,
                            className:prefix+"-option",
                            'data-disabled':disabled
                        },
                        child
                    ));
                }else if((typeof child).toLowerCase()=='object'){
                    if(child.options){
                        //应用optgroup
                        var optionChildren=context.recurseChildren(child.options,selected,disabled);
                        children.push(React.createElement(
                            'div',
                            {
                                className:prefix+'-optgroup',
                                'data-disabled':disabled
                            },
                            <div className={prefix+'-optgroup-label'}>{context.getLabel(child)}</div>,
                            ...optionChildren
                        ));
                    }else{
                        //不分组的options
                        var label=context.getLabel(child);
                        var value=child.value?child.value:(child.label?child.label:(child.name?child.value:undefined));
                        var props={
                            'data-label':label,
                            'data-value':value,
                            className:prefix+'-option',
                            'data-disabled':disabled
                        };
                        //先进行默认赋值
                        if((selected.defaultValue==undefined)&&!disabled){
                            selected.defaultValue=value;
                            selected.defaultLabel=label;
                        }
                        //进行select赋值
                        if(child.selected&&!disabled){
                            selected.defaultValue=value;
                            selected.defaultLabel=label;
                        }
                        children.push(React.createElement(
                            'div',
                            props,
                            label
                        ));
                    }
                }
            });
        }
        return children;
    },
    render: function () {
        var props=ReactUtil.getOrInitProps(this);
        this.selected={};
        var children=this.recurseChildren(props.options,this.selected,props.disabled);
        return React.createElement(
            'a',
            defaults({ref:'select',className:ClassNames(props.className,prefix+'-select'),onFocus:this.onSelectFocus,onBlur:this.onSelectBlur,onMouseLeave:this.onSelectBlur,onMouseDown:this.onClick,href:'javascript:void(0)'},ReactUtil.getPureProps(this)),
            React.createElement(
                'div',
                {className:prefix+'-select-placeholder-container'},
                React.createElement(
                    'span',
                    {ref:'selectPlaceholder'},
                    this.props.placeholder||this.selected.defaultLabel||Lang[props.lang].noOptions
                ),
                React.createElement(
                    Icon,
                    {icon:'sort',className:prefix+'-select-icon'}
                )
            ),
            React.createElement(
                'div',
                {className:prefix+'-select-panel',ref:'selectPanel'},
                ...children
            )
        );
    },
    componentDidMount:function () {
        var context=this;
        $(this.getSelectPanel()).slideUp(0);
        this.panelSlided=false;
        var enabledOptions=this.getEnabledOptions();
        var defaultValue=this.selected.defaultValue;

        if(defaultValue){
            forEach(enabledOptions,function (option) {
                if($(option).data('value')==defaultValue){
                    context.changeCurOption(option);
                    return false;
                }
            });
        }else{
            context.changeCurOption(null);
        }
        if(this.props.bundleData){
            this.props.bundleData[this.props.name]=this.selected.defaultValue;
        }
    },
    getSelectPanel:function () {
        return ReactDOM.findDOMNode(this.refs['selectPanel']);
    },
    onOptionSelect:function (option) {
        var $option=$(option);
        $(ReactDOM.findDOMNode(this.refs['selectPlaceholder'])).text($option.data('label'));
        if(this.props.bundleData){
            this.props.bundleData[this.props.name]=$option.data('value');
        }
        if(this.props.onOptionSelect){
            this.props.onOptionSelect.call(this,$option.data('value'),$option.data('label'));
        }
        this.onSelectBlur();
    },
    getEnabledOptions:function () {
        return $(this.getSelectPanel()).find('[data-disabled!=false]');
    },
    changeCurOption:function (newOption) {
        if(newOption==null){
            this.curIndex=-1;
            this.curOption=null;
            return ;
        }
        if(!$(newOption).data('disabled')){
            var enabledOptions=this.getEnabledOptions();
            if(this.curOption){
                $(this.curOption).removeClass('active');
            }
            this.curIndex=indexOf(enabledOptions,newOption);
            this.curOption=newOption;
            $(this.curOption).addClass('active');
        }
    },
    slidePanel:function (open) {
        var context=this;
        var isSliding=this.isSliding||false;
        if(!isSliding){
            this.isSliding=true;
            if(open){
                this.panelSlided=true;
                $(this.getSelectPanel()).slideDown(function () {
                    context.isSliding=false;
                });
            }else{
                this.panelSlided=false;
                $(this.getSelectPanel()).slideUp(function () {
                    context.isSliding=false;
                });
            }
        }
    },
    onSelectFocus:function (e) {
        this.keyPress=new EventUtil(e.target,this);
        var enabledOptions=this.getEnabledOptions();
        this.keyPress.on('keydown',function (event) {
            event.preventDefault();
            switch(event.keyCode){
                case 13://enter
                    if(!this.panelSlided){
                        this.slidePanel(true);
                    }else if((this.curIndex!=-1)&&(this.curOption!=null)){
                        this.onOptionSelect(this.curOption);
                    }
                    break;
                case 38://向上
                    if(this.curIndex>0){
                        this.changeCurOption(enabledOptions[--this.curIndex]);
                    }
                    break;
                case 40://向下
                    if((this.curIndex>=0)&&(this.curIndex<enabledOptions.length-1)){
                        this.changeCurOption(enabledOptions[++this.curIndex]);
                    }
                    break;
            }
        });
    },
    onSelectBlur:function () {
        var context=this;
        this.blur=window.setTimeout(function () {
            context.slidePanel(false);
            if(context.keyPress){
                context.keyPress.off('keydown');
            }
        },100);
    },
    onClick:function (e) {
        window.clearInterval(this.blur);
        var target=e.target;
        if(!this.panelSlided){
            this.slidePanel(true);
        }else {
            var $target=$(target);
            if(($target.data('value')!=undefined)&&(!$target.data('disabled'))){
                this.changeCurOption(target);
                this.onOptionSelect(target);
            }
        }
    }
});
module.exports = Select;
