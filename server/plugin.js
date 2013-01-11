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

/**
 * Extend will overwrite only when plugin.js is loaded outside a specific function scope. Hard-coding path from this index.js file for now
 */
utils.loadAllWrappers(__dirname + '/..');

require.extensions['.js'] = _.wrap(require.extensions['.js'], function(parent, module, filename) {
    utils.compileWrapper(module, filename);
    return parent.call(this, module, filename);
});