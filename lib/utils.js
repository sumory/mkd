
exports.getSeparator =function() {
    var isWin = (process.platform === 'win32'); //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    return  (isWin) ? '\\' : '/';
};


exports.isWin =function() {
    return (process.platform === 'win32'); //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
};