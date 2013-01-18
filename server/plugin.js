var bonesPath = require.resolve(global.__BonesPath__ || 'bones')
  , Bones = require(bonesPath)
  , fs = require('fs')
  , path = require('path')
  , utils = Bones.utils
  , plugin = Bones.plugin
  , debug = require('debug')('bones-boiler:plugin');

/***************** BEGIN BONES **********************/

// added until makara's pull request fulfills more flexible structure for plugins

require.extensions['.bones.js'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var wrappers = wrappers || utils.wrappersServer; // CHANGED FROM ORIGINAL
    var kind = utils.singularize(path.basename(path.dirname(filename)));

    wrappers[kind] = wrappers[kind] || {};
    wrappers[kind].prefix = wrappers[kind].prefix || '';
    wrappers[kind].suffix = wrappers[kind].suffix || '';

    content = wrappers[kind].prefix + ';' + content + '\n;' + wrappers[kind].suffix;
    module._compile(content, filename);

    if (module.exports) {
        Bones.plugin.add(module.exports, filename);
    }
};

require.extensions['.bones'] = require.extensions['.bones.js'];

/***************** END BONES **********************/

// load bones and bones-boiler wrappers into utils
utils.loadAllWrappers(path.join(require.resolve(bonesPath), '..'));
utils.loadAllWrappers(__dirname + '/..');

// wrap the .js file and compile it if a wrapper has been registered for it
require.extensions['.js'] = _.wrap(require.extensions['.js'], function(parent, module, filename) {
    utils.compileWrapper(module, filename);
    return parent.call(this, module, filename);
});

// expose and register jekyll pages in bones.plugin
require.extensions['.html'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');

    // If an err is thrown need to fix the output from printing 'template' to 'pages.'
    try {
        module.exports.content = content;
        Bones.plugin.add(module.exports, filename);
    } catch(err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in page ' + filename);
        err.message = lines.join('\n');
        throw err;
    }

    // Expose page fetches from the static asset server.
    module.exports.register = function(app) {
        if (app.assets && !(/\.server\._$/.test(filename))) {
            app.assets.pages.push({
                filename: filename,
                content: 'page = ' + module.exports.source + ';'
            });
        }
    };
};

// 0.9.2 compatibility
Bones.Backbone.setDomLibrary(Bones.$);

// initialize plugin additions
plugin.pages = {};
plugin.backends = {};
plugin.bootstrapList = [];

// load server-side libraries
Bones.Backend = require('./backend');
Bones.Backbone.Form = require('backbone-forms/distribution/backbone-forms');
Bones.utils.aliasWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
Bones.Backbone.Marionette = require('backbone.marionette/lib/backbone.marionette.js');

// wrap to load your own compiled directory structure
// note: bones.plugin.add uses the parent directory of
// the required file to register the file's 'kind,' templates in this case
plugin.loadCompiled = function(dir) {
    this.require(dir, 'templates/compiled/templates');  // Load statically-compiled templates that will still be dynamic.
    this.require(dir, 'templates/compiled/pages');      // Load static pages for wrapper rendering.
};

plugin.load = _.wrap(plugin.load, function(parent, dir) {
    this.require(dir, 'backends');
    this.loadCompiled(dir);
    parent.call(this, dir);
    return this;
});