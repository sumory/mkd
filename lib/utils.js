
exports.getSeparator =function() {
    var isWin = (process.platform === 'win32'); //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    var separator = (isWin) ? '\\' : '/';
    return separator;
}