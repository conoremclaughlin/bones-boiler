var Bones   = require(global.__BonesPath__ || 'bones');
var fs      = require('fs');
var path    = require('path');
var utils   = Bones.utils;

/***************** BEGIN BONES **********************/

// added until pull request fulfills more flexible structure for plugins

require.extensions['.bones.js'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var wrappers = wrappers || utils.wrappersServer; // changed from original
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

Bones.plugin.pages = {};
Bones.plugin.backends = {};

/**
 * Extend will overwrite only when plugin.js is loaded outside a specific function scope. Hard-coding path from this index.js file for now
 */
utils.loadAllWrappers(__dirname + '/..');

require.extensions['.js'] = _.wrap(require.extensions['.js'], function(parent, module, filename) {
    utils.compileWrapper(module, filename);
    return parent.call(this, module, filename);
});

/**
 * Exposes html pages to Bones so they can be rendered with
 * a wrapping dynamic view for things like logged-in users (App._ for example)
 * TODO: this can be done more elegantly now that I know Bones better.
 */
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

/**
 * OVERRIDE this to load and use your own statically compiled directory structure.
 * Note: Bones.plugin.add uses the parent directory of the file to describe its 'kind'
 * for storage in the Plugin, hence templates/compiled/templates.
 * TODO: May create new addTemplate to allow more flexible directories.....
 */
Bones.plugin.loadCompiled = function(dir) {
    this.require(dir, 'templates/compiled/templates');  // Load statically-compiled templates that will still be dynamic.
    this.require(dir, 'templates/compiled/pages');      // Load static pages for wrapper rendering.
};

Bones.plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    parent.call(this, dir);
    this.loadCompiled(dir);
    return this;
});