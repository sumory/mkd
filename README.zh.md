# mkd

Markdown文件编辑和预览工具, 包括命令行使用和浏览器编辑等.


## 安装

直接使用`npm`安装即可

```
npm install -g mkd
```


## 使用

[English](./README.md) [中文](./README.zh.md)  

```
格式: mkd [命令][参数] 

  命令:

    render [参数]       渲染一个Markdown文件.
    server [参数]       启动一个服务, 打开浏览器编辑和预览Markdown文件.
    
  示例:
  
    mkd server                             在当前目录下启动server, 预览和编辑当前目录下的Markdown文件.
    mkd server -d /data/mk -p 8888         在目录'/data/mk'下启动server, 端口为8888.
    mkd render -f abc.md                   渲染当前目录下的'abc.md', 并将结果输出到终端.
    mkd render -f /mk/abc.md -o            渲染文件'/mk/abc.md', 并将根据文件名将结果输出到当期那目录下的'abc.html'.
    mkd render -f /mk/abc.md -o cbd.html   渲染文件'/mk/abc.md', 并指明输出文件名

  对于`mkd server`和`mkd render`命令中的目录参数均可以支持绝对路径和相对路径
 ```

## 预览

![](https://raw.github.com/sumory/mkd/master/assets/server.png)




## License 

(The MIT License)