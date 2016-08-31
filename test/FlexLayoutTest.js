var React=require('react');
var ReactDOM=require('react-dom');
var _=require('lodash');
import Select from './component/select/Select'
import FlexLayout from '../src/FlexLayout';
require('./base.less');
require('./flexLayoutTest.less');
var FlexLayoutTestComponent=React.createClass({
    getInitialState:function () {
        return {
            flexDirection:'row',
            flexWrap:'wrap',
            justifyContent:'flex-start',
            alignItems:'center',
            alignContent:'flex-start',
            childrenStyle:[
                {},
                {},
                {}
            ]
        }
    },
    render:function () {
        var context=this;
        var state=this.state;
        var flexContainerStyle={
            backgroundColor:'#dddddd',
            display:'flex',
            height:'500px',
            width:'auto',
            flexDirection:state.flexDirection,
            flexWrap:state.flexWrap,
            justifyContent:state.justifyContent,
            alignItems:state.alignItems,
            alignContent:state.alignContent
        };
        var childrenStyle=[
            {
                backgroundColor:'#FD817F',
                width:'100px',
                height:'200px',
                fontSize:'10px',
                color:'white',
            },
            {
                backgroundColor:'#28C55A',
                width:'200px',
                height:'auto',
                fontSize:'20px',
                color:'white',
                alignSelf:'stretch'
            },
            {
                backgroundColor:'#63C1FF',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#00ff00',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#ff383c',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#7bcbff',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#8cff72',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#ae96ff',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#df36ff',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#ea96af',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            },
            {
                backgroundColor:'#77C2FF',
                width:'200px',
                height:'100px',
                fontSize:'30px',
                color:'white',
            }
        ];
        var flexDirectionOptions=[{label:'row',value:'row'},{label:'row-reverse',value:'row-reverse'},{label:'column',value:'column'},{label:'column-reverse',value:'column-reverse'}];
        _.forOwn(flexDirectionOptions,function (option,index) {
            if(option.value==context.state.flexDirection){
                option.selected=true;
            }
        });
        var flexWrapOptions=[{label:'nowrap',value:'nowrap'},{label:'wrap',value:'wrap'},{label:'wrap-reverse',value:'wrap-reverse'}];
        _.forOwn(flexWrapOptions,function (option,index) {
            if(option.value==context.state.flexWrap){
                option.selected=true;
            }
        });
        var justifyContentOptions=[{label:'flex-start',value:'flex-start'},{label:'flex-end',value:'flex-end'},{label:'center',value:'center'},{label:'space-between',value:'space-between'},{label:'space-around',value:'space-around'}];
        _.forOwn(justifyContentOptions,function (option,index) {
            if(option.value==context.state.justifyContent){
                option.selected=true;
            }
        });
        var alignItemsOptions=[{label:'flex-start',value:'flex-start'},{label:'flex-end',value:'flex-end'},{label:'center',value:'center'},{label:'baseline',value:'baseline'},{label:'stretch',value:'stretch'}];
        _.forOwn(alignItemsOptions,function (option,index) {
            if(option.value==context.state.alignItems){
                option.selected=true;
            }
        });
        var alignContentOptions=[{label:'flex-start',value:'flex-start'},{label:'flex-end',value:'flex-end'},{label:'center',value:'center'},{label:'space-between',value:'space-between'},{label:'space-around',value:'space-around'},{label:'stretch',value:'stretch'}];
        _.forOwn(alignContentOptions,function (option,index) {
            if(option.value==context.state.alignContent){
                option.selected=true;
            }
        });
        return <div style={{width:'100%',height:'100%'}}>
            <div>
                <span className="flex-options">
                    <label>设置flexDirection</label>
                    <Select name="flexDirection" options={flexDirectionOptions} onOptionSelect={function(value,label) {
                      context.setState({
                        flexDirection:value
                      });
                    }}/>
                </span>
                <span className="flex-options">
                    <label>设置flexWrap</label>
                    <Select name="flexWrap" options={flexWrapOptions} onOptionSelect={function(value,label) {
                      context.setState({
                        flexWrap:value
                      });
                    }}/>
                </span>
                <span className="flex-options">
                    <label>设置justifyContent</label>
                    <Select name="justifyContent" options={justifyContentOptions} onOptionSelect={function(value,label) {
                      context.setState({
                        justifyContent:value
                      });
                    }}/>
                </span>
                <span className="flex-options">
                    <label>设置alignItems</label>
                    <Select name="alignItems" options={alignItemsOptions} onOptionSelect={function(value,label) {
                      context.setState({
                        alignItems:value
                      });
                    }}/>
                </span>
                <span className="flex-options">
                    <label>设置alignContent</label>
                    <Select name="alignContent" options={alignContentOptions} onOptionSelect={function(value,label) {
                      context.setState({
                        alignContent:value
                      });
                    }}/>
                </span>
            </div>
            <div>FlexLayout兼容性效果</div>
            <FlexLayout flexMode="compat" style={flexContainerStyle}>
                <div style={childrenStyle[0]} className="flex-child-1">模块1</div>
                <div style={childrenStyle[1]} className="flex-child-2">模块2</div>
                <div style={childrenStyle[2]} className="flex-child-3">模块3</div>
                <img src={require('./flower.png')}/>
                <div style={childrenStyle[3]} className="flex-child-1">模块5</div>
                <div style={childrenStyle[4]} className="flex-child-2">模块6</div>
                <div style={childrenStyle[5]} className="flex-child-3">模块7</div>
                <div style={childrenStyle[6]} className="flex-child-1">模块8</div>
                <div style={childrenStyle[7]} className="flex-child-2">模块9</div>
                <div style={childrenStyle[8]} className="flex-child-3">模块10</div>
                <div style={childrenStyle[9]} className="flex-child-3">模块11</div>
                <div style={childrenStyle[10]} className="flex-child-3">模块12</div>
            </FlexLayout>
            <div>原生Flex布局效果</div>
            <span style={flexContainerStyle}>
                <div style={childrenStyle[0]} className="flex-child-1">模块1</div>
                <div style={childrenStyle[1]} className="flex-child-2">模块2</div>
                <div style={childrenStyle[2]} className="flex-child-3">模块3</div>
                <img src={require('./flower.png')}/>
                <div style={childrenStyle[3]} className="flex-child-1">模块5</div>
                <div style={childrenStyle[4]} className="flex-child-2">模块6</div>
                <div style={childrenStyle[5]} className="flex-child-3">模块7</div>
                <div style={childrenStyle[6]} className="flex-child-1">模块8</div>
                <div style={childrenStyle[7]} className="flex-child-2">模块9</div>
                <div style={childrenStyle[8]} className="flex-child-3">模块10</div>
                <div style={childrenStyle[9]} className="flex-child-3">模块11</div>
                <div style={childrenStyle[10]} className="flex-child-3">模块12</div>
            </span>
        </div>;
    },
    componentDidUpdate:function () {
        // console.log('更新')
    }
});
console.log('xxx');
ReactDOM.render(<FlexLayoutTestComponent />,document.getElementById('app'));

