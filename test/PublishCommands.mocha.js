require('./fixture');

var debug = require('debug')('bones-boiler:PublishCommands.mocha')
  , fs = require('fs')
  , path = require('path')
  , bonesTest = require('bones-test')
  , server = bonesTest.server()
  , Bones = require('bones')
  , Backend = Bones.Backend

describe('Publish', function() {
    var config = {};

    before(function(done) {
        server.start(function(err) {
            config = _.clone(server.plugin.config);
            done(err);
        });
    });

    after(function(done) {
        try { server.close(done); }
        catch (err) { } // server already closed.
    });

    describe('Template', function() {
        it('should create a template at the argument directory given viewName, modelName, and directory path', function(done) {
            var options = {
                view: 'Form',
                model: 'Lorem',
                directory: './test/fixture/templates'
            };
            var command = server.plugin.commands.PublishTemplate;

            server.plugin.config = _.clone(config);
            server.plugin.loadConfig(command);
            server.plugin.config = _.extend(server.plugin.config, options);

            new command(server.plugin, function(err) {
                if (err) return done(err);
                var filePath = path.join(options.directory, options.view + options.model + '._');
                fs.exists(filePath, function(isExist) {
                    if (!isExist) return done('file not written.');
                    fs.unlink(filePath, function(err) {
                        if (err) console.error('error unlinking. You may need to delete the template file yourself :( ', err);
                        return done(err);
                    });
                });
            });
        });
    });

    describe('Mirror', function() {
        it('should create a static file at the argument directory given mirror name, and directory path', function(done) {
            var options = {
                mirror: 'all',
                directory: './test/fixture/assets',
            };

            var command = server.plugin.commands.PublishMirror;
            server.plugin.config = _.clone(config);
            server.plugin.loadConfig(command);
            server.plugin.config = _.extend(server.plugin.config, options);

            new command(server.plugin, function(err) {
                if (err) return done(err);
                var filePath = path.join(options.directory, options.mirror + '.js');
                fs.exists(filePath, function(isExist) {
                    if (!isExist) return done('file not written.');
                    fs.unlink(filePath, function(err) {
                        if (err) console.error('error unlinking. You may need to delete the mirror file yourself :( ', err);
                        return done(err);
                    });
                });
            });
        });

        it('should create a minified static js file at the argument directory given mirror name, directory path, and minify=true', function(done) {
            var options = {
                mirror: 'all',
                directory: './test/fixture/assets',
                minify: true
            };

            var command = server.plugin.commands.PublishMirror;
            server.plugin.config = _.clone(config);
            server.plugin.loadConfig(command);
            server.plugin.config = _.extend(server.plugin.config, options);

            new command(server.plugin, function(err) {
                if (err) return done(err);
                var filePath = path.join(options.directory, options.mirror + '.minify' + '.js');
                fs.exists(filePath, function(isExist) {
                    if (!isExist) return done('file not written.');
                    fs.unlink(filePath, function(err) {
                        if (err) console.error('error unlinking. You may need to delete the mirror file yourself :( ', err);
                        return done(err);
                    });
                });
            });
        });
    });

    describe('AllMirrors', function() {
        it('should create static files at the argument directory for all mirrors given a directory path', function(done) {
            var options = {
                directory: './test/fixture/assets',
                minify: false
            };

            var command = server.plugin.commands.PublishAllMirrors;
            server.plugin.config = _.clone(config);
            server.plugin.loadConfig(command);
            server.plugin.config = _.extend(server.plugin.config, options);

            new command(server.plugin, function(err) {
                if (err) return done(err);
                fs.readdir(options.directory, function(err, list) {
                    // all, plugin, main, vendor, core, models, templates, views, routers... anything else?
                    var error;
                    list.length.should.equal(9);
                    if (err) return done(err);
                    list.forEach(function(fileName) {
                        try {
                            fs.unlinkSync(path.join(options.directory, fileName));
                        } catch(err) {
                            error = err;
                        }
                    });
                    return done(error);
                });
            });
        });
    });
});
