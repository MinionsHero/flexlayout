
### 使用说明

1、通过如下命令将FlexLayout下载到本地
*<font color=#555555 size=2>首先需要学会使用React框架和Webpack,不会的请<a href="http://www.jianshu.com/p/7d0e1eaab50a">点击这里,10分钟学会webpack配置</a></font>*
```
  npm install --save-dev flexlayout
```
2、导入FlexLayout到你想要使用的js/jsx文件
```
  import FlexLayout from 'flexlayout';
  或者也可以这样写
  var FlexLayout =require('flexlayout');
``` 
3、开始使用FlexLayout标签,所有flex属性都需要写入到style属性中,就像原生的使用普通标签一样。
*<font color=#555555 size=2>注意:不支持将flex属性写入到class中,同时不需要设置style的display属性为flex,FlexLayout不支持复合属性,如flex,也不支持order,如想实现order效果,请自己调整子标签的顺序即可,或者通过js控制,以后有时间会进一步支持;如果FlexLayout的子标签是自定义标签,请保证自定义元素的style属性能够被内部HTML元素所继承</font>*

```
<FlexLayout style={{width:"100%",height:"auto",flexDirection:"row",flexWrap:"nowrap",justifyContent:"center",alignItems:"flex-start"}}>
    <div style={{alignSelf:"flex-start"}}></div>
    <div style={{flexShrink:1}}></div>
</FlexLayout>

```
### 属性：
>
```
type
参数类型:string,
    参数释义:FlexLayout默认采用的标签类型
    默认值:div,
    举例:span、a、div等
flexMode
    参数类型:枚举,只能是auto/flex/compat,
    参数释义:当前使用的flex模式,
        auto-自动根据浏览器支持性来判断,确定是否需要用原生flex支持还是用js polyfill;
        flex-强制用原生浏览器支持,这样会导致不支持flex的浏览器没有任何flex效果。
        compat-强制用js实现flex效果,会忽略原生的flex引擎渲染,如果你想屏蔽浏览器之间实现flex的差异,可以用这个模式,但是该模式会降低浏览器的性能
    默认值:auto,
    举例:auto/flex/compat
style
    参数类型:object,
    参数释义:style属性,必须把flex属性值写到这里
    默认值:{width:'100%',height:'auto',flexDirection:'row',flexWrap:'nowrap',justifyContent:'flex-start',alignItems:'stretch',alignContent:'flex-start'},
    举例:无
style(子组件的style)
    参数类型:object,
    参数释义:这个是child 的style属性,必须把child的flex属性值写到这里面
    默认值:{flexGrow:0,flexShrink:1,flexBasis:'auto',alignSelf:'auto'}
    举例:无
```
更多信息,请进入http://www.pofod.com 
有问题,请在github的issues提出