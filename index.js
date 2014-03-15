#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var marked = require('marked');
var commander = require('commander');
var beauty = require('beauty');
var version = require('./package.json').version;
var utils = require('./lib/utils.js');
var server = require('./lib/server.js');
var op = require('./lib/op.js');
var separator = utils.getSeparator();

marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});

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
		'   mkd server                             start a server at current directory.',
		'   mkd server -d /data/mk -p 8888         start server at directory "/data/mk" on port 8888.',
		'   mkd render -f abc.md                   render file "abc.md" and output result to console.',
		'   mkd render -f /mk/abc.md -o            render file "abc.md" and output result to "abc.html".',
		'   mkd render -f /mk/abc.md -o cbd.html   render file "abc.md" and output result to "cbd.html".',
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
	.command('render')
	.description('render a markdown file.')
	.option('-f, --file <string>')
	.option('-o, --output [string]', '_rendered.html')
	.action(function(env) {
		if (env.file) {

			var file = path.resolve(process.cwd(), env.file);
			console.info('\nRender file:');
			console.log(file.red);
			var exists = fs.existsSync(file);
			if (exists) {
				fs.readFile(file, 'utf8', function(err, data) {
					if (err) {
						console.error('Error when reading file.', err);
					} else {
						var rendered = marked(data);
						if (env.output) {
							var output = '_rendered.html';
							if (env.output === true || env.output === '_rendered.html') {
								output = file.substring(file.lastIndexOf(separator) + 1);
								output = output.substring(0, output.lastIndexOf('.')) + '.html';

							} else {
								output = env.output;
							}
							output = path.resolve(process.cwd(), output);
							
							fs.writeFile(output, rendered, 'utf8', function(err) {
								if (err) {
									console.error('Error when output rendered text.', err);
								} else {
									console.info('\nRender and output successfully:');
									console.log(output.red);
								}
							});
						} else {
							console.info('\nResult is:');
							console.log(rendered);
						}
					}
				});
			} else {
				console.error('file not exists.');
			}
		} else {
			console.error('Use as this: mkd render -f <filename>');
		}
	});


commander
	.command('server')
	.description('start a server to view and edit')
	.option('-d, --direcotry <string>')
	.option('-p, --port <number>', '', 8333)
	.action(function(env) {
		var abs_path = path.resolve(process.cwd(), env.direcotry || '') || process.cwd();
		var port = env.port;
		console.info('mkd is running under Path[%s] on Port[%d]', abs_path, port);

		if (fs.existsSync(abs_path)) {

			server.listen(abs_path, port);
		} else {
			console.log('your path not exists.');
			process.exit(-1);
		}
	});



commander.parse(process.argv);