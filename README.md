
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

>**支持的flex属性：**
<table>
                <tbody>
                    <tr>
                        <th>参数名称</th>
                        <th>参数类型</th>
                        <th>默认值</th>
                        <th>参数解释</th>
                        <th>举例</th>
                    </tr>
                    <tr>
                        <td>type</td>
                        <td>string</td>
                        <td>div</td>
                        <td>标签类型</td>
                        <td>span、a</td>
                    </tr>
                    <tr>
                        <td>flexMode</td>
                        <td>枚举</td>
                        <td>auto</td>
                        <td>当前使用的flex模式,可以为自动根据浏览器支持判断或者强制使用flex(这样会导致旧版浏览器不再兼容)或者兼容模式(兼容模式下,强制所有浏览器都是用js进行计算,如果你想屏蔽所有浏览器实现flex的差异,可以用这个模式,但是该模式会降低现代浏览器的性能)</td>
                        <td>auto/flex/compat</td>
                    </tr>
                    <tr>
                        <td>style</td>
                        <td>object</td>
                        <td>{{width:'100%',height:'auto',flexDirection:'row',flexWrap:'nowrap',justifyContent:'flex-start',alignItems:'stretch',alignContent:'flex-start'}}</td>
                        <td>style属性,必须把flex属性值写到这里面</td>
                        <td>无</td>
                    </tr>
                    <tr>
                        <td>style</td>
                        <td>object</td>
                        <td>{{flexGrow:0,flexShrink:1,flexBasis:'auto',alignSelf:'auto'}}</td>
                        <td>这个是child 的style属性,必须把child的flex属性值写到这里面</td>
                        <td>无</td>
                    </tr>
                </tbody>
            </table>


更多信息,请进入http://www.pofod.com 
有问题,请在github的issues提出