/*
 * mkd - lib/mkd.js
 * Copyright(c) 2014 sumory.wu <sumory.wu@gmail.com>
 */
var http = require('http');
var express = require('express');
var sockeio = require('socket.io');
var utils = require('./utils.js');
var op = require('./op.js');

var server = express();
var staticServer = express();
var httpServer = http.createServer(server);
var httpStaticServer = http.createServer(staticServer);


var separator = utils.getSeparator();

exports.listen = function(abs_path, port) {
    op.chdir(abs_path);
    var cwd = process.cwd();

    server.configure(function() {
        server.use(express.bodyParser());
        server.use(express.methodOverride());
        server.use(server.router);
        server.use(express.static(__dirname + '/../public'));
    });

    staticServer.configure(function() {
        staticServer.use(express.bodyParser());
        staticServer.use(express.methodOverride());
        staticServer.use(server.router);
        staticServer.use(express.static(cwd));
    });

    var io = sockeio.listen(httpServer, {
        'log level': 1
    })

    io.configure(function() {
        io.set('transports', ['xhr-polling', 'jsonp-polling']);
    });

    httpServer.listen(port, function() {
        httpStaticServer.listen(port + 1, function() {});
    });

    var serverErrorHandler = function(err) {
        if (err.code == 'EADDRINUSE') {
            console.error('Error: Address already in use. use another port');
            process.exit(-1);
        } else {
            console.error('Error: ', err);
            process.exit(-1);
        }
    }

    server.on('error', serverErrorHandler);
    staticServer.on('error', serverErrorHandler);

    io.sockets.on('connection', function(socket) {
        op.list(cwd, function(nodes) {
            socket.emit('cwd', cwd, cwd.substring(cwd.lastIndexOf(separator)+1), nodes);
        });

        socket.on('openfolder', function(folder) {
            op.list(folder, function(nodes) {
                socket.emit('openfolder', folder, nodes);
            });
        });

        

        socket.on('load', function(path) {
            op.load(path, function(result, file) {
                if (result) {
                    socket.emit('file', {
                        path: path,
                        error: null,
                        file: file
                    });
                } else {
                    socket.emit('file', {
                        path: path,
                        error: file,
                        file: null
                    });
                }
            });
        });

        socket.on('save', function(data) {
            op.save(data.path, data.content, function(result, desc) {
                if (result) {
                    socket.emit('save-success', {
                        path: data.path
                    });
                } else {
                    socket.emit('save-error', {
                        path: data.path,
                        error: desc
                    });
                }
            });
        });

    });
}