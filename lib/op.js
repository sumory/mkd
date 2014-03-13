var fs = require('fs');
var exec = require('child_process').exec;
var utils = require('./utils.js');
var directory = require('./directory.js');
var separator = utils.getSeparator();
var isWin = utils.isWin();

/**
 * 遍历目录
 */
exports.list = function(folder, fn) {
    console.log('list........', folder);
    var nodes = directory.walkDiretory(folder, 1);
    fn && fn(nodes);
}


/**
 * 保存文件
 */
exports.save = function(path, contents, callback) {
    console.log('save file: ', path);

    fs.writeFile(path, contents, 'utf8', function(err) {
        //console.log(err);
        if (err) {
            callback(false, 'save error');
        } else {
            callback(true);
        }
    });
}

/**
 * 加载文件
 */
exports.load = function(path, callback) {
    path = (isWin) ? path.replace('/', '\\') : path;
    console.log('load file: ', path);

    fs.stat(path, function(err, stats) {
        if (err) {
            callback(false, 'File not found.');
        } else if (stats.size > 1024 * 1024) {
            callback(false, 'File larger than the maximum supported size.');
        } else {
            fs.readFile(path, 'utf8', function(err, data) {
                if (err) {
                    callback(false, 'File could not be read.');
                } else {
                    callback(true, data);
                }
            });
        }
    });

}


/**
 * 改变当前工作目录
 */
exports.chdir = function(dir) {
    if (dir) {
        try {
            process.chdir(dir);
        } catch (e) {
            console.error('Could not change working directory to `' + dir + '`.');
            process.exit(-1);
        }
    }
}