#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var commander = require('commander');
var beauty = require('beauty');
var version = require('./package.json').version;

var server = require('./lib/server.js');
var op =require('./lib/op.js');
var mkd = require('./lib/mkd.js');

beauty.beautifyConsole();
beauty.beautifyStr();

commander.version(version)
	.option('-v, --version', 'Show the current version');

commander.on('--help', function() {
	var usage = [
		'',
		'  Usage: mkd  [commands][options]',
		'',
		'  Demos:',
		'',
		'    mkd        ',
		''
	].join('\n');

	console.info(usage);
});

commander
	.command('config')
	.description('')
	.action(function() {
		console.warn('mkd config');
	});

commander
	.command('help')
	.description('help.')
	.option('-d, --detail <param1>,<param2>', '', function(val) {
		return val.split(',');
	})
	.action(function(env) {
		var detail = env.detail || [];
		console.info('mkd help tips.');
	});


commander
	.command('server')
	.description('')
	.option('-d, --direcotry <string>')
	.option('-p, --port <number>')
	.action(function(env) {
		var abs_path = path.resolve(process.cwd(), env.direcotry || '') || process.cwd();
		var port = env.port || 8222;
		console.info('mkd is running under Path[%s] on Port[%d]', abs_path, port);

		if (fs.existsSync(abs_path)) {
			
			server.listen(abs_path, port);
		} else {
			console.log('your path not exists.');
			process.exit(-1);
		}
	});


commander.parse(process.argv);