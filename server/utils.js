var fs    = require('fs');
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

