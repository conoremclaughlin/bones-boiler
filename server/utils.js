var fs    = require('fs');
var path  =  require('path');
var Bones = require(global.__BonesPath__ || 'bones');
var utils = Bones.utils;

/**
 * Extend will overwrite only when plugin.js is loaded outside a specific function scope. Hard-coding path from this index.js file for now
 */
utils.wrappersServer = _.extend(utils.wrappersServer, utils.loadWrappers(__dirname));

/**
 * A bindAll that doesn't recurse down the prototype-chain.  Only binds the
 * immediate prototype.
 * TODO: TEST TEST TEST, _.bindAll(this) is breaking stuff! so wrote my own.
 */
utils.shallowBindAll = function(object) {
    _.each(object.prototype, function(property) {
        if (_.isFunction(property)) _.bind(property, object);
    });
};

/**
 * Map from CRUD to HTTP from the default `Backbone.sync` implementation.
 */
utils.methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
};

utils.registerWrapperForFile = function(filename, wrapper) {
    filename = require.resolve(filename);
    utils.wrappersServer[filename] = utils.wrappersServer[wrapper];
};

utils.compileWrapper = function(module, filename) {
    var wrapper = utils.wrappersServer[filename];
    var content = fs.readFileSync(filename, 'utf8');
    if (!content) throw new Error('unable to read file: ', filename);

    if (wrapper) {
        if (wrapper.prefix) content = wrapper.prefix + ';' + content;
        if (wrapper.suffix) content += '\n;' + wrapper.suffix;
        module._compile(content, filename);
    }
};

utils.wrapClientAll = function(content, filename) {
    return "Bones.initialize(function(models, views, routers, templates) {"
    + content
    + "});";
};

utils.wrapClientPlugin = function(content, filename) {
    return "Bones.initialize(function(models, views, routers, templates, Bones) {"
    + content
    + "});";
};

/**
 * Load shared/ Bones plugin files then server/
 * It will require certain things twice but node.js's
 * caching lets us not care.
 *
 * TODO: sort alphabetically?
 * @param parentDir is the directory of the index.js file calling.
 */
utils.loadServerPlugin = function(parentDir) {
    var directories = ['shared', 'server'];
    directories.forEach(function(dir) {
        var directory = path.join(parentDir, dir);
        var files = [];

        // read directory and filter out non-files and prefixes/suffixes.
        if (!fs.existsSync(directory)) return;
        files = fs.readdirSync(directory);
        files = _.reject(files, function(file) {
            var isNotFile = fs.statSync(path.join(directory, file)).isDirectory();
            isNotFile = isNotFile || file.match(/^(.+)\.(prefix|suffix)\.js$/);
            return isNotFile;
        });

        // read yaml front matter of each file and expose a get if a front-matter has a url property.
        _.each(files, function(file) {
            require(path.join(directory, file));
        });
    });
}

/**
 * XXX: this doesn't return the code, properly
 */
utils.requireWithWrap = function(module, filename, kind) {
    filename = require.resolve(filename);
    var content = fs.readFileSync(filename, 'utf8');
    content = utils.wrappersServer[kind].prefix + ';' + content + '\n;' + utils.wrappersServer[kind].suffix;
    module._compile(content, filename);
    return module.require(filename);
};

