var path = require('path')
  , fs = require('fs')
  , debug = require('debug')('bones-boiler:PublishMirror');

command = Bones.Command.extend();

command.description = 'Write a file for a mirror in plugin.assets.';

command.options['mirror'] = {
    'title': 'mirror=[mirrorName]',
    'description': 'Mirror to write.',
};

command.options['directory'] = {
    'title': 'directory=[path]',
    'description': 'Directory to write the template.',
    'default': './assets'
};

command.options['minify'] = {
    'title': 'minify=[minify]',
    'description': 'Minify output file.',
};

/**
 * Great for creating static templates like forms from model schemas.
 */
command.prototype.initialize = function(plugin, callback) {
    var originalMinify;
    var options = command.extractOptions(command, plugin);
    var route = new plugin.servers['Route'](plugin);
    var mirror = route.assets[options.mirror];
    debug('plugin: ', plugin);
    debug('mirror: ', mirror);

    if (options.minify) {
        originalMinify = mirror.options.minify;
        mirror.options.minify = options.minify;
    }

    route.assets[options.mirror].handler.call(this, {}, {
        send: function(resp, headers) {
            var error = '';
            options.mirror = options.minify
                           ? options.mirror + '.minify' + mirror.options.type
                           : options.mirror + mirror.options.type;
            try {
                fs.writeFileSync(path.join(options.directory, options.mirror), resp);
            } catch(err) {
                if (err) console.error('Failed to write: ', err);
                error = err;
            }
            mirror.options.minify = originalMinify || mirror.options.minify;
            return callback && callback(error);
        }
    }, function(err) {
        console.error('Failed to retrieve the mirror: ', err);
        mirrror.options.minify = originalMinify;
    });
};
