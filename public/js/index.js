var aceConfig = {
	tabSize: 4,
	fontSize: '12px',
	showPrintMargin: false
};
var cwd = "";
var stateByPath = {};
var saveFileCallbacks = {};
var loadFileCallbacks = {};

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
	var parentElement =getElementByAttr(folder);//参数folder即为文件夹path，根据data-path属性获取这个li元素
	var ul = document.createElement("ul");
	for (var n in nodes) {
		addHTMLElementForFileEntry(nodes[n], ul);
	}
	//parentElement.innerHTML = '';
	parentElement.appendChild(ul);
});

function getElementByAttr(attr_path){
	var lis = document.getElementsByTagName("li");
	for (var i = 0, max = lis.length; i < max; i++) {
		if (lis[i].getAttribute("data-path") == attr_path) {
			return lis[i];
		}
	}
}

//点击打开某个文件夹，去服务器获取它目录下的文件夹和文件
function openFolder(folder){
	socket.emit('openfolder', folder);
}

//关闭文件夹，清楚它下面的节点
function closeFolder(folder, name){
	getElementByAttr(folder).innerHTML ='<img src="img/folder.png">' + name;
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
				if($(this).hasClass('open')){
					stateByPath[entry.path] = 'open';
					openFolder(entry.path);
				}
				else{
					stateByPath[entry.path] = '';
					closeFolder(entry.path, entry.name);
				}
			}
		});
	} else {
		thisElement.className = 'file';
		thisElement.innerHTML = '<img src="img/file.png">' + entry.name;
	}

	parentElement.appendChild(thisElement);
}







