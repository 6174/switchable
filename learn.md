##kissy-gallery 学习笔记
---
1. 配置kissy
   首先git clone下 整个kissy的项目目录， 放在localhost上面或者自己服务器上面的一个地方， 然后配置脚本
   ```javascript
    	<script type="text/javascript" src="http://localhost/kissy/build/seed.js"></script>
	<script>
		var S = KISSY;
		if(S.Config.debug) {
		    S.config({
			//kissy 的基准路径， 就是down下来的kissy， 不过要配置的build目录下面
		    	base: "http://localhost/kissy/build",
			//pacakges 没有配配置成功， 尝试更改， 发现nothing change
			packages:{
				"kissy-gallery":{
			        base: "../../kissy-gallery/", 
			        charset: "utf-8",
			        ignorePackageNameInUri: true
				}
			}
		    });
		}
	</script>
    ```
2. 配置kissy-gallery 开发环境
   <a href="http://gallery.kissyui.com/quickstart?spm=0.0.0.0.CV5pUE">官方网址</a> 
   * sudo apt-get install node
   * sudo apt-get install npm
   * sudo npm install -g grunt
   * sudo npm install yo grunt-cli -g
   * sudo npm intall npm install generator-kissy-gallery -g
   * sudo chmod +777 /home/xuejia/tmp
   * 创建一个git仓库
   * yo kissy-gallery 1.0
   * grunt （每次更改了index.js 运行grunt命令就可一编译到build目录下面

3. 使用自己的gallery

```javascript
 	KISSY.add("/kissy-gallery/switchable/1.0/build/index", function(S, DOM, Event, Anim, Node, Base){
		//your code
	});
```
最关键的地方就是add和use的路径了， /表示重网站根目录开始寻找， 这里也就是http://localhost/kissy-gallery/...如果不加/ 就会在kissy的base目录下面去寻找
我本来以为配置package就可一更改这一特性， 结果尝试了多种方法也无法改变目录, 最终只有重从根目录开始
```javascript
	KISSY.use('dom, event, anim, node, base, /kissy-gallery/switchable/1.0/build/', function(S, DOM, Event, Anim, Node, Base, NewsSlider){
		S.ready(function(){
		  //your code
		});
        });
```
  





