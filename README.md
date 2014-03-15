# mkd

cli to view and edit markdown files. still under heavy development.


## Install

```
npm install -g mkd
```


## Usage

[English](./README.md) [中文](./README.zh.md)  

```
Usage: mkd [command][options] 

  Commands:

    help [options]         help tips.
    render [options]       render a markdown file.
    server [options]       start a server to view and edit files.
    
  Demos:
  
    mkd server                             start a server at current directory.
    mkd server -d /data/mk -p 8888         start server at directory '/data/mk' on port 8888.
    mkd render -f abc.md                   render file 'abc.md' and output result to console.
    mkd render -f /mk/abc.md -o            render file 'abc.md' and output result to 'abc.html'.
    mkd render -f /mk/abc.md -o cbd.html   render file 'abc.md' and output result to 'cba.html'.
 ```



![](https://raw.github.com/sumory/mkd/master/assets/server.png)




## License 

(The MIT License)

Copyright (c) 2014 sumory.wu &lt;sumory.wu@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.