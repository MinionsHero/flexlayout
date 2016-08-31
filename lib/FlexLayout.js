/**
 * @license MIT
 * pofod <https://www.pofod.com/>
 * Released under MIT license
 */

//---------------------------------------------------------
/**
 * 实现原理，通过浮动和清除浮动来组织child。
 * 根据flexWrap对child进行分组。
 * 只设置child的必要属性值，如margin，主轴size等。
 * 计算步骤：分配容器->计算felxGrow/shrink->根据alignContent布局次级容器->布局child，顺序不能颠倒！
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ClassNames from 'classnames';
import $ from 'jquery';
import {StyleUtil,ReactUtil,DeferUtil} from './util/Util';
import WindowResizeMixins from'./base/WindowResizeMixins';
import {defaults,omit,forEach,cloneDeep,isEqual,last} from 'lodash';
require('./flexLayout.less');
var prefix='flexlayout';
/**
 * Flex兼容性弹性布局容器，能够实现和display:flex一样的功能。在新版浏览器中，它将默认自动使用浏览器内核的flex布局。在不支持flex布局的浏览器中会通过js来控制。
 * 该组件的的相关flex属性必须写到style里面，不支持通过className来判断（浏览器本身对不支持的css属性是无法获取值的）。同时子组件的flex相关属性亦是如此。
 * 在flex布局中，默认容器的width=100%,height=auto，并不关心它是否为block元素;不允许设置width/height=0,这样会自动判断为auto。
 * 注意！ 父容器和子组件不支持混合属性，如flex-flow，flex，请使用单独属性替代。
 * 注意！ 子组件不支持order属性，同时请不要和绝对布局和浮动混用！！
 * 注意！ 这不是一个足够完美的兼容性方案，请不要使用过于复杂的flex嵌套，否则会有性能问题。
 * 注意！ 请不要通过jquery或css选择器等控制FlexLayout的直接子元素。
 * @bug 当设置child的flexShrink属性时，如果container足够小，会导致和真实地flex布局不一致。（未解决）
 * @bug 当设置alignItems=baseline时（flexDirection=row的情况下），这时已经影响到全局布局，需要对subContainer进行重新布局才行（未解决）
 * @bug 加载img标签对图片的压缩规则和原生flex不太一致
 * @type {ClassicComponentClass<P>}
 * @property {string|ClassicComponentClass} type 当前容器的标签类型
 * @property {auto|flex|compat} flexMode flex模式，auto：根据浏览器支持情况选择，flex：强制使用flex模式（对于不支持flex的浏览器会造成布局混乱，但可以避免渲染性能降低，不建议开启此模式，否则使用该组件将失去意义），compat：强制兼容模式（无论浏览器是否支持flex布局，都强制使用js控制，这样能保持体验的一致性，有些浏览器对flex的实现由略微差异）
 * @style {string} flexDirection 类似flexBox中的flexDirection，其值只能是：row/row-reverse/column/column-reverse，默认为row
 * @style {string} flexWrap 类似flexBox中的flexWrap，其值只能是：nowrap/wrap/wrap-reverse'，默认为nowrap
 * @style {string} justifyContent 类似flexBox中的justifyContent，其值只能是：flex-start/flex-end/center/space-between/space-around，默认flex-start
 * @style {string} alignItems 类似flexBox中的alignItems，其值只能是：flex-start/flex-end/center/baseline/stretch，默认stretch
 * @style {string} alignContent 类似flexBox中的alignContent，其值只能是：flex-start/flex-end/center/space-between/space-around/stretch，默认flex-start
 * @childStyle {number} flexGrow 类似flexBox中的flexGrow,默认为0
 * @childStyle {number} flexShrink 类似flexBox中的flexShrink，默认为1
 * @childStyle {string} flexBasis 类似flexBox中的flexBasis,使用尺寸值,如px/rem/em/%/auto，默认auto
 * @childStyle {string} alignSelf 类似flexBox中的alignSelf,其值只能是：auto/flex-start/flex-end/center/baseline/stretch,默认为auto
 */
var FlexLayout = React.createClass({
    displayName: 'FlexLayout',
    propTypes: {
        type:React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.node]),//元素类型
        flexMode:React.PropTypes.oneOf(['auto','flex','compat']),
        style: React.PropTypes.object.isRequired
    },
    getDefaultProps: function () {
        return {
            type: 'div',
            flexMode:'auto',
            style: {
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                alignContent: 'stretch',
            },
        }
    },
    isSupportFlex:function (props) {
        switch(props.flexMode){
            case 'auto':
                return StyleUtil.isSupportFlex();
            case 'flex':
                return true;
            case 'compat':
                return false;
        }
    },
    /**
     * 判断当前是否处于行模式
     * @returns {boolean}
     */
    isRowAlign: function (props) {
        if(! props){
            props=this.props?this.props:{};
        }
        var style=props.style?props.style:{};
        var flexDirection = style.flexDirection || 'row';
        return flexDirection.indexOf('row') != -1;
    },
    /**
     * 根据对齐方向获得合适的style方向模型
     * @param rowAlign
     * @returns {{mainAxis: string, crossAxis: string}}
     */
    getBoxModel: function (rowAlign = this.isRowAlign()) {
        return rowAlign ? {
            mainAxis: 'width',
            crossAxis: 'height',
            outerMainAxis: 'outerWidth',
            outerCrossAxis: 'outerHeight',
            marginNegative: 'marginLeft',
            marginPositive: 'marginRight',
            paddingNegative: 'paddingLeft',
            paddingPositive: 'paddingRight'
        } : {
            mainAxis: 'height',
            crossAxis: 'width',
            outerMainAxis: 'outerHeight',
            outerCrossAxis: 'outerWidth',
            marginNegative: 'marginTop',
            marginPositive: 'marginBottom',
            paddingNegative: 'paddingTop',
            paddingPositive: 'paddingBottom'
        };
    },
    /**
     * 计算FlexContainer和Children的flex属性值
     */
    computeFlexStyle: function (props) {
        var isRowAlign = this.isRowAlign(props);
        var boxModel = this.getBoxModel(isRowAlign);
        var style = props.style?props.style:{};
        var computedStyle = defaults({},style, {
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            alignContent: 'stretch',
            height: 'auto'
        });
        computedStyle.width=(computedStyle.width || 'auto') =='auto'?'100%':computedStyle.width;
        if(computedStyle.flexDirection.indexOf('reverse')!=-1){
            if(computedStyle.justifyContent=='flex-start'){
                computedStyle.justifyContent='flex-end';
            }else if(computedStyle.justifyContent=='flex-end'){
                computedStyle.justifyContent='flex-start';
            }
        }
        if(computedStyle.flexWrap.indexOf('reverse')!=-1){
            if(computedStyle.alignContent=='flex-start'){
                computedStyle.alignContent='flex-end';
            }else if(computedStyle.alignContent=='flex-end'){
                computedStyle.alignContent='flex-start';
            }
        }
        var alignItems = computedStyle.alignItems || 'stretch';
        delete computedStyle.alignItems;
        var computedChildrenStyle = [];

        var percentRep=new RegExp('^(([0-9]+\.[0-9]+)|([0-9]+))%?$');
        var flexShrinkTotal=0;
        React.Children.forEach(props.children,function (child, index) {
            var childStyle = ReactUtil.getOrInitStyle(child);
            if(percentRep.test(childStyle[boxModel.mainAxis])){
                flexShrinkTotal+=parseInt(childStyle[boxModel.mainAxis]);
            }
        },this);
        React.Children.forEach(props.children, function (child, index) {
            var childStyle = ReactUtil.getOrInitStyle(child);
            var flexShrink=0;
            if(flexShrinkTotal>0){
                if(percentRep.test(childStyle[boxModel.mainAxis])){
                    flexShrink=parseInt(childStyle[boxModel.mainAxis])/flexShrinkTotal;
                }else{
                    flexShrink=0;
                }
            }else{
                flexShrink:(childStyle.flexShrink!=undefined)?childStyle.flexShrink:1;
            }
            var computedChildStyle = defaults({},childStyle, {
                flexGrow: 0,
                flexShrink: flexShrink
            });
            //alignSelf默认赋值alignItems
            if ((computedChildStyle.alignSelf || 'auto') == 'auto') {
                computedChildStyle.alignSelf = alignItems;
            }
            //flexBasis会覆盖主轴size
            if ((computedChildStyle.flexBasis || 'auto') != 'auto') {
                computedChildStyle[boxModel.mainAxis] = computedChildStyle.flexBasis;
            }
            delete computedChildStyle.flexBasis;
            computedChildrenStyle.push(computedChildStyle);
        }, this);
        var children=[];
        if (this.isSupportFlex(props)) {
            computedStyle.display = 'flex';
        } else {
            computedStyle.display = 'block';
            React.Children.forEach(props.children,function (child,index) {
                var childStyle=computedChildrenStyle[index];
                childStyle.display = 'block';
                childStyle.float='left';
                if(!isRowAlign){
                    childStyle.clear = 'left';
                }
                childStyle.verticalAlign='baseline';//verticalAlign自动失效，这里强制设置成baseline
                children.push({
                    element:child,
                    props:{style:childStyle},
                    children:ReactUtil.getOrInitProps(child).children,
                });
            },this);
        }
        return {
            style: computedStyle,
            children:children
        };
    },
    getInitialState: function () {
        var styleBundle = this.computeFlexStyle(this.props);
        return {
            reLocation: this.resolveAuto,
            computeProps:styleBundle
        }
    },
    deepCloneProps:function (props) {
        var cloneProps={};
        if(props.style){
            cloneProps.style=defaults({},props.style);
        }
        cloneProps=defaults({},omit(props,['style']),cloneProps);
        return cloneProps;
    },
    render: function () {
        var context=this;
        var props = ReactUtil.getOrInitProps(this);
        var computeProps = this.state.computeProps;
        var omitProps=ReactUtil.getPureProps(this);
        if(this.isSupportFlex(props)){
            return React.createElement(
                props.type,
                defaults({},{style:cloneDeep(computeProps.style)},omitProps),
                props.children?props.children:[]
            );
        }else{
            var reLocation=this.state.reLocation;
            var flexContainerProps=defaults({},{
                style: cloneDeep(computeProps.style),
                className: ClassNames(props.className,prefix + '-flex-layout-container'),
                ref: 'flexContainer'
            },omitProps);
            var subContainers=[];
            if(reLocation==this.resolveAuto||reLocation==this.allocateSubContainers){
                forEach(computeProps.children,function (child, index) {
                    subContainers.push(ReactUtil.cloneElement(
                        child.element,
                        context.deepCloneProps(child.props),
                        //第一次resolveAuto对child内部置空，以便计算是否size为auto
                        //但是对CustomComponent，即自定义组件该方法是不起作用的
                        child.children
                    ));
                });
            }else{
                forEach(computeProps.children,function (subContainer, index) {
                    var children=[];
                    forEach(subContainer.children,function (child, index) {
                        children.push(ReactUtil.cloneElement(
                            child.element,
                            context.deepCloneProps(child.props),
                            child.children
                        ));
                    });
                    subContainers.push(React.createElement(
                        subContainer.element,
                        cloneDeep(subContainer.props),
                        ...children
                    ));
                });
            }
            return React.createElement(
                props.type,
                flexContainerProps,
                ...subContainers
            );
        }
    },
    resize: function () {
        if (this.isMounted()) {
            this.replaceState(this.getInitialState());
        }
    },
    componentDidMount: function () {
        //支持flex时默认不进行重布局
        var props = ReactUtil.getOrInitProps(this);
        if (!this.isSupportFlex(props)) {
            var context=this;
            DeferUtil.deferCalcSize(ReactDOM.findDOMNode(this.refs['flexContainer']),function () {
                context.componentDidUpdate();
            });
            this.windowResize=new WindowResizeMixins(this.resize);
        }
    },
    componentWillUnmount:function () {
        if(this.windowResize){
            this.windowResize.dismiss();
        }
    },
    componentWillReceiveProps:function (nextProps) {
        if(!isEqual(this.props,nextProps)){
            var styleBundle = this.computeFlexStyle(nextProps);
            this.setState({
                reLocation: this.resolveAuto,
                computeProps:styleBundle
            });
        }
    },
    //不允许使用这种方式进行判断更新,当flex和内部flex两个mode不一致,会导致内部flex不更新
    // shouldComponentUpdate: function (nextProps,nextState) {
    //     var equal= (_isEqual(this.props,nextProps));
    //     console.log(equal)
    //     return !equal;
    //     // return !this.isSupportFlex(nextProps);//支持flex时默认不更新
    // },
    componentDidUpdate: function () {
        if(!this.isSupportFlex(this.props)){
            this.state.reLocation.call(this);
        }
    },
    calcAlignSelf:function (childStyle,flexWrap,isAuto) {
        if ((childStyle.alignSelf == 'stretch')&& (!isAuto)) {
            childStyle.alignSelf = 'flex-start';
        }
        if(flexWrap){
            if(childStyle.alignSelf=='flex-start'){
                childStyle.alignSelf='flex-end';
            }else if(childStyle.alignSelf=='flex-end'){
                childStyle.alignSelf='flex-start';
            }
        }
    },
    resolveAuto:function () {
        var context=this;
        var boxModel = this.getBoxModel();
        var $container = $(ReactDOM.findDOMNode(this.refs['flexContainer']));
        var computeProps=this.state.computeProps;
        var children = computeProps.children;
        var flexWrap=computeProps.style.flexWrap.indexOf('reverse')!=-1;
        var childrenDOMs=$container.children();
        var deferArray=[];
        childrenDOMs.each(function (index,child) {
            var childStyle=children[index].props.style;
            var $child=$(child);
            var subChildren=$child.children();
            $child.empty();
            var size=$(child)[boxModel.crossAxis]();
            switch(child.nodeName.toLowerCase()){
                case 'img':
                    if(child.src){
                        var image=new Image();
                        image.src=child.src;
                        var defer=$.Deferred();
                        deferArray.push(defer);
                        image.onload=function () {
                            childStyle[boxModel.mainAxis]=$(child)[boxModel.mainAxis]();
                            context.calcAlignSelf(childStyle,flexWrap,image[boxModel.crossAxis]==size);
                            defer.resolve();
                        }
                    }
                    break;
                case 'video':

                    break;
                default:
                    context.calcAlignSelf(childStyle,flexWrap,size==0);
                    break;
            }
            $child.append(subChildren);
            //目前没有检测width/height值为auto的方法，只能得到其计算值，只能判断其值是否=0来表示auto
            //If alignSelf=='stretch'同时交叉轴size已确定非'auto'（size=0即auto），这时应优先应用交叉轴的size而非让其stretch占满交叉轴

        });
        $container.empty();
        if($container.height()==0){
            computeProps.style.height='auto';
        }
        $container.append(childrenDOMs);
        $.when(...deferArray).done(function () {
            context.replaceState({
                reLocation:context.allocateSubContainers,
                computeProps:context.state.computeProps
            });
        });
    },
    /**
     * 根据排列方向和flexWrap，为child分配subContainer,
     * 只涉及计算child尺寸并对其进行分组，分组之后不限定SubContianer的crossAxis尺寸。
     */
    allocateSubContainers: function (childrenProps) {
        var computeProps = this.state.computeProps;
        var flexWrap = computeProps.style.flexWrap;
        var isRowAlign = this.isRowAlign();
        var boxModel = this.getBoxModel(isRowAlign);
        // var subContainerRowAlign=!isRowAlign;
        // var subContainerBoxModel=this.getBoxModel(subContainerRowAlign);
        var $container = $(ReactDOM.findDOMNode(this.refs['flexContainer']));
        var childrenDOMs=$container.children();
        var containerSize = $container[boxModel.mainAxis]();
        var children = computeProps.children;
        var initSubContainer=function () {
            return {
                element:'div',
                props: {
                    className: ClassNames(prefix + '-flex-layout-container', isRowAlign ? 'row' : 'column'),
                    // style: {
                    //     [boxModel.mainAxis]: isRowAlign?'100%':'auto',
                    //     [boxModel.crossAxis]: (computeProps.style.height||'auto')=='auto'?'auto':$container.height()
                    // }
                    style:{
                        width:isRowAlign?'100%':'auto',
                        height:isRowAlign?'auto':((computeProps.style.height||'auto')=='auto'?'auto':'100%')
                    }
                },
                children: new Array()
            }
        };
        var subContainers = [initSubContainer()];
        if (flexWrap != 'nowrap') {
            var sum = 0;
            $(childrenDOMs).each(function (index,child) {
                var mainSize = $(child)[boxModel.outerMainAxis](true);
                sum += mainSize;
                var tailSubContainer=last(subContainers);
                if(tailSubContainer.children.length==0||(sum <= containerSize)){
                    tailSubContainer.children.push(children[index]);
                }else{
                    subContainers.push(initSubContainer());
                    last(subContainers).children.push(children[index]);
                    sum = mainSize;
                }
            });
        }else{
            forEach(children,function (child) {
                last(subContainers).children.push(child);
            });
        }
        if(subContainers.length==1){
            last(subContainers).props.style.width='100%';
            last(subContainers).props.style.height=(computeProps.style.height||'auto')=='auto'?'auto':'100%';
        }
        if(computeProps.style.flexDirection.indexOf('reverse')!=-1){
            forEach(subContainers,function (subContainer) {
                subContainer.children.reverse();
            });
        }
        if(flexWrap == 'wrap-reverse'){
            subContainers.reverse();
        }
        this.replaceState({
            reLocation:this.growOrShrinkChildren,
            computeProps:{
                style:computeProps.style,
                children:subContainers
            }
        });
    },
    /**
     * 根据grow和shrink进行每行/列的伸缩
     */
    growOrShrinkChildren: function () {
        var computeProps = this.state.computeProps;
        var boxModel = this.getBoxModel();
        var $container = $(ReactDOM.findDOMNode(this.refs['flexContainer']));
        var subContainerDOMs = $container.children();
        forEach(computeProps.children,function (subContainer, index) {
            //1.先计算subContainer内部的child的对齐方式，它们会影响subContainer的布局
            var $subContainer = $(subContainerDOMs[index]);
            var subContainerSize = $subContainer[boxModel.mainAxis]();
            var children = subContainer.children;
            var growSum = 0, shrinkSum = 0, childrenTotalSize = 0, childrenShrinkTotalSize = 0;
            var subChildren = $subContainer.children();
            forEach(children,function (child, childIndex) {
                var $child = $(subChildren[childIndex]);
                growSum += child.props.style.flexGrow;
                shrinkSum += child.props.style.flexShrink;
                childrenTotalSize += $child[boxModel.outerMainAxis](true);
                childrenShrinkTotalSize += child.props.style.flexShrink * $child[boxModel.outerMainAxis](false);
            });
            var restSubContainerSpace = subContainerSize - childrenTotalSize;
            if (growSum > 0 && restSubContainerSpace > 0) {
                forEach(children,function (child, childIndex) {
                    child.props.style[boxModel.mainAxis] = $(subChildren[childIndex])[boxModel.outerMainAxis](false) + restSubContainerSpace * child.props.style.flexGrow / growSum;
                });
            }
            if(restSubContainerSpace<0){
                if (shrinkSum > 0 && restSubContainerSpace < 0) {
                    // var minSizeArray=new Array();
                    // _forEach(children,function (child, childIndex) {
                    //     var $child=$(subChildren[childIndex]);
                    //     var oldMainSize=$child[boxModel.outerMainAxis](false);
                    //     $child.css(boxModel.mainAxis,'auto');
                    //     var minMainSize=$child[boxModel.outerMainAxis](false);
                    //     minSizeArray.push(minMainSize);
                    //     $child.css(boxModel.mainAxis,oldMainSize);
                    // });
                    //问题遗留：！！！！需要保证child的最小尺寸，但是最小尺寸无法计算。
                    forEach(children,function (child, childIndex) {
                        var $child = $(subChildren[childIndex]);
                        var mainSize = $child[boxModel.outerMainAxis](false);
                        var reduceRate = mainSize * child.props.style.flexShrink / childrenShrinkTotalSize;
                        var shrinkResult = mainSize + reduceRate * restSubContainerSpace;
                        child.props.style[boxModel.mainAxis] = shrinkResult;
                    });
                }
            }
        });
        this.setState({
            reLocation: this.reLayoutSubContainer,
            computeProps:computeProps
        });
    },
    /**
     * 根据alignContent对subContainer进行重布局
     */
    reLayoutSubContainer: function () {
        var context=this;
        var computeProps = this.state.computeProps;
        var alignContent = computeProps.style.alignContent;
        var isRowAlign=!this.isRowAlign();
        var crossBoxModel = this.getBoxModel(isRowAlign);
        var $container = $(ReactDOM.findDOMNode(this.refs['flexContainer']));
        var subContainerDOMs = $container.children();
        var containerSize = $container[crossBoxModel.mainAxis]();
        var subContainers = computeProps.children;
        var sum = 0, restContainerSpace = 0;
        forEach(subContainers,function (subContainer, index) {
            sum += $(subContainerDOMs[index])[crossBoxModel.mainAxis]();
        });
        restContainerSpace = containerSize - sum;
        //如果subContainer超过container主轴空间，不操作
        if (restContainerSpace > 0) {
            forEach(subContainers,function (subContainer, index) {
                var $subContainer = $(subContainerDOMs[index]);
                if (alignContent == 'stretch') {
                    subContainer.props.style[crossBoxModel.mainAxis] = $subContainer[crossBoxModel.mainAxis]() + restContainerSpace / subContainers.length;
                } else {
                    subContainer.props.style = context.layoutMainAxis(alignContent, crossBoxModel, subContainer.props.style, restContainerSpace, index, subContainers.length, $subContainer);
                }
            });
        }
        this.replaceState({
            reLocation: this.reLayoutChildren,
            computeProps:computeProps
        });
    },
    cssInt:function ($elem,prop) {
        return parseInt($elem.css(prop));
    },
    layoutMainAxis: function (flexValue, boxModel, style, restSpace, index, total, $child) {
        switch (flexValue) {
            case 'flex-start':
                break;
            case 'flex-end':
                if(index==0){
                    var margin=boxModel.marginNegative;
                    style[margin]=this.cssInt($child,margin)+restSpace;
                }
                break;
            case 'center':
                if(index==0){
                    style[boxModel.marginNegative]=this.cssInt($child,boxModel.marginNegative)+restSpace/2;
                }
                break;
            case 'space-between':
                style[boxModel.marginPositive] = this.cssInt($child,boxModel.marginPositive) + (index < total - 1 ? restSpace / (total - 1) : 0);
                break;
            case 'space-around':
                var aroundSpace = restSpace / (total * 2);
                style[boxModel.marginNegative] = this.cssInt($child,boxModel.marginNegative) + aroundSpace;
                style[boxModel.marginPositive] = this.cssInt($child,boxModel.marginPositive) + aroundSpace;
                break;
        }
        return style;
    },
    calcBaseLine:function ($elem) {

        if($elem.text()==''){
            return $elem.outerHeight();
        }else{
            return this.cssInt($elem,'padding-top')+this.cssInt($elem,'border-top-width')+(this.cssInt($elem,'line-height')-this.cssInt($elem,'font-size'))*0.9/2+this.cssInt($elem,'font-size');
        }
    },
    reLayoutChildren: function () {
        var computeProps=this.state.computeProps;
        var isRowAlign = this.isRowAlign();
        var $container = $(ReactDOM.findDOMNode(this.refs['flexContainer']));
        var subContainerDOMs = $container.children();
        var subContainers = computeProps.children;
        var mainAxisBoxModel = this.getBoxModel(isRowAlign);
        var crossAxisBoxModel = this.getBoxModel(!isRowAlign);
        var context=this;
        forEach(subContainers,function (subContainer, index) {
            //1.先计算subContainer内部的child的对齐方式，它们会影响subContainer的布局
            var $subContainer = $(subContainerDOMs[index]);
            var children = subContainer.children;
            var totalBaseline = 0, restSubContainerSpace = 0;
            var subChildren = $subContainer.children();
            forEach(children,function (child, childIndex) {
                var $child = $(subChildren[childIndex]);
                var alignSelf = child.props.style.alignSelf;
                if (alignSelf == 'baseline' && isRowAlign) {
                    var childBaseline = context.calcBaseLine($child);
                    totalBaseline = childBaseline > totalBaseline ? childBaseline : totalBaseline;
                }
                restSubContainerSpace += $child[mainAxisBoxModel.outerMainAxis](true);
            });
            restSubContainerSpace = $subContainer[mainAxisBoxModel.mainAxis]() - restSubContainerSpace;
            forEach(children,function (child, childIndex) {
                var childProps=child.props;
                var $child = $(subChildren[childIndex]);
                var alignSelf = childProps.style.alignSelf;
                if (alignSelf == 'baseline' && isRowAlign) {
                    childProps.style.marginTop = totalBaseline - context.calcBaseLine($child);//baseline的计算不涉及宽/高
                } else {
                    childProps.style = context.layoutCrossAxis(childProps.style.alignSelf, crossAxisBoxModel, childProps.style, $subContainer[crossAxisBoxModel.mainAxis](), childIndex, $child);
                }
                if (restSubContainerSpace > 0) {//布局主轴
                    childProps.style = context.layoutMainAxis(computeProps.style.justifyContent, mainAxisBoxModel, childProps.style, restSubContainerSpace, childIndex, children.length, $child);
                }
            });
        });
        this.setState({
            reLocation: this.end,
            computeProps:computeProps
        });
    },
    layoutCrossAxis: function (flexValue, boxModel, style, containerSize, index, $child) {
        switch (flexValue) {
            case 'flex-start':
                break;
            case 'flex-end':
                style[boxModel.marginNegative] = this.cssInt($child,boxModel.marginNegative) + containerSize - this.cssInt($child,boxModel.mainAxis) - this.cssInt($child,boxModel.marginPositive);
                break;
            case 'center':
                style[boxModel.marginNegative] = this.cssInt($child,boxModel.marginNegative) + (containerSize - this.cssInt($child,boxModel.mainAxis)) / 2;
                break;
            case 'stretch':
                style[boxModel.mainAxis] = containerSize;//会改变内部子布局
                break;
        }
        return style;
    },
    end:function () {
        console.log('%c Use compatible flex,access %c http://www.pofod.com %c to get it! ',"color:red","color:blue","color:red");
    }
});
module.exports = FlexLayout;
