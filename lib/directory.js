var fs = require('fs');
var utils = require('./utils.js');
var separator = utils.getSeparator();

/**
 * 遍历目录，最大深度不超过limit_deepth
 */
exports.walkDiretory = function(root, limit_deepth) {
    var nodes = [];
    var deepth = 0;

    function walk(path) {
        deepth = getDeepth(path, root);

        if (deepth > limit_deepth) {
            return;
        } else {
            var node = {
                type: 'file',
                path: path,
                name: path.substring(path.lastIndexOf(separator) + 1),
                deepth: deepth
            };

            var fileType = fs.statSync(path);
            if (fileType.isFile()) {
                node.type = 'file';
                nodes.push(node);
            } else if (fileType.isDirectory()) {
                var pathList = fs.readdirSync(path);
                node.type = 'directory';
                if (node.path !== root) nodes.push(node);
                pathList.forEach(function(item) {
                    walk(path + separator + item);
                });
            }
        }
    }

    walk(root);
    return nodes.sort(sortNodes);
}

/**
 * 根据两个路径得到相对深度
 */
function getDeepth(path, prefix) {
    if (path.indexOf(prefix) === 0) { //path的前缀是prefix
        var relative_path = path.substring(prefix.length);
        var tmp_path_array = relative_path.split(separator);
        return tmp_path_array.length - 1;
    } else {
        return -1;
    }
    return 0;
}

/**
 * 排序数组
 */
function sortNodes(x, y) {
    if (x.deepth > y.deepth) { // 先按深度排序，由低到高
        return 1;
    } else if (x.deepth == y.deepth) {
        if (x.type > y.type) { //深度相同，按类型排序，文件夹在前，文件在后
            return 1;
        } else if (x.type == y.type) {
            if (x.name > y.name) { // 类型相同，则再按名称排序
                return 1;
            } else if (x.name == y.name) {
                return 0;
            } else {
                return -1;
            }
        } else {
            return -1;
        }
    } else {
        return -1;
    }
}

//测试
function test (){
    var nodes = walkDiretory(process.cwd(), 1);

    for (var i = 0; i < nodes.length; i++) {
        var item = nodes[i];
        console.log(item.deepth + '\t' + item.type + '\t' + item.name + '\t\t' + item.path);
    }
}