var path = require('path')
  , fs = require('fs')
  , underscore = require('underscore')
  , Mirror = require('mirror')
  , async = require('async');

command = Bones.Command.extend();

command.description = 'Write files for all mirrors in plugin.assets.';

command.options['directory'] = {
    'title': 'directory=[path]',
    'description': 'Directory to write the mirror files.',
    'default': './assets'
};

command.options['minify'] = {
    'title': 'minify=[minify]',
    'description': 'Minify output file.',
};

/**
 * PublishAllMirrors to a directory (minified or not) found in Route.assets.
 *
 * @see above for prototype.
 */
command.prototype.initialize = function(plugin, callback) {
    var funcs = [];
    var route = new plugin.servers['Route'](plugin);
    var keys = _.keys(route.assets);

    keys.forEach(function(assetName) {
        if (route.assets[assetName] instanceof Mirror) {
            funcs.push(function(_callback) {
                plugin.config.mirror = assetName;
                new plugin.commands.PublishMirror(plugin, function(err) {
                    if (err) {
                        console.error('could not create ', assetName, ' err: ', err);
                    }
                    _callback(err);
                });
            });
        }
    });

    async.parallel(funcs, function(err, results) {
        callback(err);
    });
};
