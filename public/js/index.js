var aceConfig = {
    tabSize: 4,
    fontSize: '12px',
    showPrintMargin: false
};

marked.setOptions({//marked基本配置，前后端通用
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

var cwd = "";
var stateByPath = {};
var loadFileCallbacks = {};
var openFilesTable = []; //所有打开的tab
var aceEditors = {}; //所有aceEditors
var currentFile = {};

var socket = io.connect(window.location.origin, {
    'connect timeout': 20000
});

socket.on('cwd', function(c, name, nodes) {
    cwd = c;
    $('#root_path').attr('data-type', 'directory').attr('data-path', c).text(name);

    //显示根目录下的文件夹和文件
    var ul = document.createElement("ul");
    for (var n in nodes) {
        addHTMLElementForFileEntry(nodes[n], ul);
    }
    document.getElementById('files').innerHTML = '';
    document.getElementById('files').appendChild(ul);
});


socket.on('openfolder', function(folder, nodes) {
    var parentElement = getElementByAttr(folder); //参数folder即为文件夹path，根据data-path属性获取这个li元素
    var ul = document.createElement("ul");
    for (var n in nodes) {
        addHTMLElementForFileEntry(nodes[n], ul);
    }
    parentElement.appendChild(ul);
});


socket.on('file', function(data) {
    var callbacks = loadFileCallbacks[data.path] || [];
    for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](data.error, data.file);
    }
    delete loadFileCallbacks[data.path];
});


function getElementByAttr(attr_path) {
    var lis = document.getElementsByTagName("li");
    for (var i = 0, max = lis.length; i < max; i++) {
        if (lis[i].getAttribute("data-path") == attr_path) {
            return lis[i];
        }
    }
}

//点击打开某个文件夹，去服务器获取它目录下的文件夹和文件
function openFolder(folder) {
    socket.emit('openfolder', folder);
}

//关闭文件夹，清楚它下面的节点
function closeFolder(folder, name) {
    getElementByAttr(folder).innerHTML = '<img src="img/folder.png">' + name;
}


function openFile(entry) {
    $('.selected').removeClass('selected');
    var index = new Date().getTime();

    if (entry.path.match(/\.(jpe?g|png|ico|gif|bmp)$/)) { //如果是图片则显示图片，点击后跳转到图片
        if (openFilesTable[entry.path]) { //已存在在打开文件列表中，只要让它显示即可
            showTab(openFilesTable[entry.path].index);
        } else { //不在打开文件列表中，须创建，然后让它显示
            openFilesTable[entry.path] = {
                name: entry.name,
                path: entry.path,
                index: index,
                type: 'img'
            };
            $('#name-tabs').append('<li name-tab-index="' + index + '"><a class="tab" href="#">' + entry.name + '</a><a class="icon close" href="#"></a></li>');
            newImgEditor(entry, index);
        }
    } else { //是文件，创建AceEditor
        if (openFilesTable[entry.path]) { //已存在在打开文件列表中，只要让它显示即可
            showTab(openFilesTable[entry.path].index);
        } else { //不在打开文件列表中，须创建，然后让它显示
            openFilesTable[entry.path] = {
                name: entry.name,
                path: entry.path,
                index: index,
                type: 'file'
            };
            $('#name-tabs').append('<li name-tab-index="' + index + '"><a class="tab" href="#">' + entry.name + '</a><a class="icon close" href="#"></a></li>');
            newFileEditor(entry, index);
        }
    }
}

function newImgEditor(entry, index) {
    var editor = $('<div class="code-editor"></div>');
    var imagePath = document.location.protocol + "//" + document.location.hostname + ':' + ((parseInt(document.location.port) || 80) + 1) + entry.path.replace(cwd, '');
    console.log(imagePath)
    var image = $('<img/>');
    image.attr('src', imagePath);
    image.attr('class', 'view');
    var a = $('<a href="' + imagePath + '" target="_blank"></a>');
    a.append(image);
    editor.append(a);
    $('#code-tabs').append('<div code-tab-index="' + index + '" class="area stylesheet-style-mss">' + editor.html() + '</div>');
    showTab(index);
}

function newFileEditor(entry, index) {
    var editor = $('<div class="code-editor"></div>');
    loadFile(entry.path, function(err, file) {
        if (err) {
            var errorBar = document.createElement('div');
            errorBar.className = 'error'
            errorBar.innerHTML = '<b>Unable to open file:</b> ' + err;
            editor.append(errorBar);
            $(errorBar).hide();
            $(errorBar).fadeIn(250);
        } else {
            var mode = selectModeFromPath(entry.path); //console.log('mode is ', mode);
            var codeArea = $('<div class="ace_focus"></div>');
            codeArea.attr("id", 'ace-editor-' + index);

            if(mode==='markdown'){//如果是Markdown文件，需要分左右两栏，右栏显示实时渲染
                codeArea.attr('style', "position: absolute;top: 0px;margin: 0;bottom: 0;left: 0;right: 50%;border-top: none;");
                editor.append(codeArea);
                var rendered = marked(file);
                var renderedArea1 = $('<div></div>').attr("id", 'render-area-' + index)
                .attr('style', "position: absolute;top: 0px;margin: 0;bottom: 0;left: 50%;right: 0;border-top: none;")
                .html(rendered);

                var renderedArea = '<div  class="markdown-body entry-content" id="render-area-' + index+'" style="'+"overflow: auto;position: absolute;top: 0px;margin: 0;bottom: 0;left: 50%;right: 0;border-top: none;" +'" >'+rendered+'</div>';
          
 
                $('#code-tabs').append('<div code-tab-index="' + index + '" class="area">' +
                 editor.html() + renderedArea+'</div>');
            }
            else{
                codeArea.attr('style', "position: absolute;top: 0px;margin: 0;bottom: 0;left: 0;right: 0;border-top: none;");
                editor.append(codeArea);
                $('#code-tabs').append('<div code-tab-index="' + index + '" class="area">' + editor.html() + '</div>');
            }
                
            
           
            var aceEditor = ace.edit(codeArea.attr('id'));
            aceEditors[index] = {
                mode:mode,
                editor: aceEditor,
                changed: false,
                reRender:true //初始化后就已经渲染了，所以这里设为true
            };
            aceEditor.setTheme("ace/theme/clouds");
            aceEditor.focus();
            aceEditor.setValue(file);
            aceEditor.getSession().setMode("ace/mode/" + mode);
            aceEditor.clearSelection();
            aceEditor.setFontSize(aceConfig.fontSize);
            aceEditor.getSession().setTabSize(aceConfig.tabSize);
            aceEditor.setShowPrintMargin(aceConfig.showPrintMargin);
            aceEditor.on('change', function() {
                aceEditors[index].changed = true; //标记已修改
                 aceEditors[index].reRender = false;
                $("#name-tabs li[name-tab-index=" + index + "] .tab").text("*" + entry.name);
            });

            showTab(index);
        }
    });
}

function loadFile(path, callback) {
    socket.emit('load', path);
    if (!loadFileCallbacks[path]) {
        loadFileCallbacks[path] = [callback];
    } else {
        loadFileCallbacks[path].push(callback);
    }
}

function selectModeFromPath(path) {
    switch (true) {
        case !!path.match(/\.js$/):
            return 'javascript'
        case !!path.match(/\.coffee$/):
            return 'coffeescript'
        case !!path.match(/\.json$/):
            return 'json'
        case !!path.match(/\.x?html?$/):
            return 'html'
        case !!path.match(/\.php$/):
            return 'php'
        case !!path.match(/\.py$/):
            return 'python'
        case !!path.match(/\.rb$/):
            return 'ruby'
        case !!path.match(/\.c$/):
            return 'c_cpp'
        case !!path.match(/\.h$/):
            return 'c_cpp'
        case !!path.match(/\.cpp$/):
            return 'c_cpp'
        case !!path.match(/\.cc$/):
            return 'c_cpp'
        case !!path.match(/\.cs$/):
            return 'csharp'
        case !!path.match(/\.java$/):
            return 'java'
        case !!path.match(/\.css$/):
            return 'css'
        case !!path.match(/\.(xml|svg|od(t|p|s))$/):
            return 'xml'
        case !!path.match(/\.ejs$/):
            return 'html'
        case !!path.match(/\.jsp$/):
            return 'jsp'
        case !!path.match(/\.aspx$/):
            return 'csharp'
        case !!path.match(/\.m(arkdown|d)$/):
            return 'markdown'
        default:
            return 'text';
    }
}

//将entry添加到parentElement上
function addHTMLElementForFileEntry(entry, parentElement) {
    var thisElement = document.createElement("li");
    thisElement.setAttribute("data-type", entry.type);
    thisElement.setAttribute("data-path", entry.path);

    if (entry.type == "directory") {
        thisElement.className = 'folder';
        if (stateByPath[entry.path] == 'open') {
            thisElement.className += ' open'
        }
        thisElement.innerHTML = '<img src="img/folder.png">' + entry.name
        $(thisElement).click(function(e) {
            e.stopPropagation();
            if (!e.offsetX) e.offsetX = e.clientX - $(e.target).position().left;
            if (!e.offsetY) e.offsetY = e.clientY - $(e.target).position().top;
            if (e.target == thisElement && e.offsetY < 24) {
                $(this).toggleClass('open');
                if ($(this).hasClass('open')) {
                    stateByPath[entry.path] = 'open';
                    openFolder(entry.path);
                } else {
                    stateByPath[entry.path] = '';
                    closeFolder(entry.path, entry.name);
                }
            }
        });
    } else {
        thisElement.className = 'file';
        thisElement.innerHTML = '<img src="img/file.png">' + entry.name;
        $(thisElement).click(function(e) {
            openFile(entry);
        });
    }

    parentElement.appendChild(thisElement);
}

//~===================================tab===================================

$(document).on("click", '#name-tabs li .tab', function() {
    var index = $(this).parent('li').attr('name-tab-index');
    showTab(index);
});

$(document).on("click", '#name-tabs li .close', function() {
    var index = $(this).parent('li').attr('name-tab-index');
    if (aceEditors[index] && aceEditors[index].changed) { //是可编辑内容，如非图片，且内容已经改变
        art.dialog({
            content: "内容已被修改，请选择以下操作",
            button: [{
                value: '保存并关闭',
                callback: function() {
                    saveFileWhenClose(index, function() {
                        console.log(index);
                        closeTab(index);
                    });
                },
                focus: true
            }, {
                value: '直接关闭不保存',
                callback: function() {
                    console.log(index);
                    closeTab(index);
                }
            }, {
                value: '不关闭'
            }]
        });
    } else {
        closeTab(index);
    }
});

function closeTab(index) {
    var _this = $("#name-tabs li[name-tab-index=" + index + "] .close");
    var isThisOpen = _this.prev('a').hasClass('active'); //如果当前这个tab是open的
    var prev = _this.parent('li').prev('li').attr('name-tab-index');
    var next = _this.parent('li').next('li').attr('name-tab-index');
    var show_index = prev ? prev : (next ? next : undefined);

    $('#name-tabs>li[name-tab-index=' + index + ']').remove();
    $('#code-tabs>div[code-tab-index=' + index + ']').remove();

    for (var i in openFilesTable) { //从打开的tab列表中删除该项
        if (openFilesTable[i].index == index) {
            delete openFilesTable[i];
            break;
        }
    }
    delete aceEditors[index];

    if (show_index && isThisOpen) {
        showTab(show_index);
    }

    //控制是否显示方向键
    if (500 <= $("#name-tabs").width()) {
        $(".left_move").show();
        $(".right_move").show();
    } else {
        $(".left_move").hide();
        $(".right_move").hide();
    }
}

function showTab(index) {
    $('#name-tabs>li').each(function() {
        if ($(this).attr('name-tab-index') == index) {
            $(this).children('.tab').addClass('active');
        } else {
            $(this).children('.tab').removeClass('active');
        }
    });

    $('#code-tabs>div').each(function() {
        if ($(this).attr('code-tab-index') == index) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });


    //scroll
    var a = $("#name-tabs li[name-tab-index=" + index + "]");
    var hm = $(".tabs-box");
    var al = a.position().left;
    var pl = hm.position().left;
    if (al < pl || al + a.width() > pl + hm.width()) {
        hm.scrollLeft(hm.scrollLeft() + al - pl);
    }

    //控制是否显示方向键
    if (500 <= $("#name-tabs").width()) {
        $(".left_move").show();
        $(".right_move").show();
    } else {
        $(".left_move").hide();
        $(".right_move").hide();
    }

    //重置目前打开的file基本信息
    for (var i in openFilesTable) { //从打开的tab列表中删除该项
        if (openFilesTable[i].index == index) { //即当前打开的tab
            currentFile = openFilesTable[i];
            $('.header').text('当前文件: ' + i);
            break;
        }
    }
}

function hscroll() {
    var s = 20 * ($(this).hasClass('left_move') ? -1 : 1);
    $(document).mouseup(function() {
        var t = self.timer;
        if (t) {
            window.clearInterval(t);
        }
    });
    self.timer = window.setInterval(function() {
        var l = $('.tabs-box').scrollLeft();
        $('.tabs-box').scrollLeft(l + s);
    }, 20);
    return self.timer;
}

$('.left_move').mousedown(hscroll);
$('.right_move').mousedown(hscroll);

function mousescroll(direct) {
    var s = 20 * direct;
    var l = $('.tabs-box').scrollLeft();
    $('.tabs-box').scrollLeft(l + s);
}

$(".tabs-box").mousewheel(function(event, delta, deltaX, deltaY) {
    if (deltaY > 0) {
        mousescroll(-1);
    } else if (deltaY <= 0) {
        mousescroll(1);
    }

    event.stopPropagation();
    event.preventDefault();
});


//~====================================保存操作==================================
var k = new Kibo();
k.down(['ctrl s'], saveHandler);
k.down(['command s'], saveHandler);

function saveHandler(e) {
    e.preventDefault();
    if (currentFile && currentFile.type === 'file') { //当前有打开‘文件类型’的文件
        var index = currentFile.index;
        saveFile(index, currentFile.path, aceEditors[index].editor.getValue(), function(err) {
            var tabName = $("#name-tabs li[name-tab-index=" + index + "] .tab").text() || '';
            if (err) {
                art.dialog({
                    content: '保存文件[' + tabName.substring(1) + ']出错',
                    button: [{
                        value: '确定',
                        focus: true
                    }]
                });
            } else {
                aceEditors[index].changed = false;
                $("#name-tabs li[name-tab-index=" + index + "] .tab").text(tabName.substring(1));
            }
        });
    }
}

function saveFileWhenClose(index, callback) {

    var thisFile = undefined;
    for (var i in openFilesTable) { //从打开的tab列表中选
        if (openFilesTable[i].index == index) {
            thisFile = openFilesTable[i];
            break;
        }
    }

    if (thisFile && thisFile.type === 'file') { //当前有打开‘文件类型’的文件
        saveFile(index, thisFile.path, aceEditors[index].editor.getValue(), function(err) {
            var tabName = $("#name-tabs li[name-tab-index=" + index + "] .tab").text() || '';
            if (err) {
                art.dialog({
                    content: '保存文件[' + tabName.substring(1) + ']出错',
                    button: [{
                        value: '确定',
                        focus: true
                    }]
                });
            } else {
                aceEditors[index].changed = false;
                $("#name-tabs li[name-tab-index=" + index + "] .tab").text(tabName.substring(1));

                callback && callback();
            }
        });
    }
}

//index为生成的唯一标识--时间戳
function saveFile(index, path, content, callback) {
    socket.emit('save', {
        index: index,
        path: path,
        content: content
    }, function(data) {
        //console.dir(data);
        if (data.result) { //保存成功
            //console.log('保存文件[', data.path, ']成功');
            callback && callback(null);
        } else {
            //console.log('保存文件[', data.path, ']失败');
            callback && callback(true);//有错误发生
        }
    });
};

setInterval(function(){
    if (currentFile && currentFile.type === 'file') { //当前有打开‘文件类型’的文件
        var index = currentFile.index;
        if(aceEditors[index].mode==='markdown' && !aceEditors[index].reRender){
            var content = aceEditors[index].editor.getValue();
            var rendered = marked(content);
            $('#render-area-'+index).html(rendered);
            aceEditors[index].reRender = true;
        }
    }
},2000);