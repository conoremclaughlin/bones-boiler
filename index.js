var Bones = require('bones');
var fs = require('fs');
var path = require('path');
var utils = Bones.utils;

// TODO: Make this a command. Seems a bit clunky as is.
// Create softlinks to any template directories so the static rendering process
// can access them.
console.log('adding bones-boiler');

// Map from CRUD to HTTP from the default `Backbone.sync` implementation.
utils.methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
};

// Globally expose url helper from inside bones model sync.
utils.getUrl = function(object) {
    if (!(object && object.url)) {
        throw new Error("A 'url' property or function must be specified");
    }
    return _.isFunction(object.url) ? object.url() : object.url;
};

// Credits: http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
utils.checkNested = function(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments),
        obj = args.shift();

    for (var i = 0; i < args.length; i++) {
        if (!obj.hasOwnProperty(args[i])) {
            return false;
        }
        obj = obj[args[i]];
    }
    return true;
};

/**
 * Credit to: backbone-forms for this method.
 * Gets a nested attribute using a path e.g. 'user.name'
 *
 * @param {Object} obj    Object to fetch attribute from
 * @param {String} path   Attribute path e.g. 'user.name'
 * @return {Mixed}
 * @api private
 */
utils.getNested = function(obj, path) {
    var fields = path.split(".");
    var result = obj;
    for (var i = 0, n = fields.length; i < n; i++) {
        result = result[fields[i]];
    }
    return result;
};

// Making suffix/prefix wrappers more flexible because utils.wrappersServer is set
// only when plugin.js is loaded outside a specific function scope. Hard-coding path from this index.js file for now
// TODO: rewrite Bones to be more flexible and make pull request to dev-seed.
require.extensions['.bones.js'] = _.wrap(req.extensions['.bones.js'], function(parent, module, filename) {
    var bonesWrappers = utils.wrappersServer;
    if (utils.singularize(path.basename(path.dirname(filename)) === 'backend')) {
        utils.wrappersServer = utils.loadWrappers('server');
    }
    parent.call(this);

    utils.wrappersServer = bonesWrappers;
});

// Override bones.sync and backbone.sync methods.
// TODO: fix, probably won't work just like this lol
require('./server/backbone');

// Load and expose Backend class in bones.
Bones.Backend = require('./server/backend');

// Add backends to plugin and automatically load from directory.
Bones.plugin.backends = {};

// Wrap load to include the backends directory as well.
// XXX: may have problems here with this pointer. *shakes fist at javascript*
plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    parent.call(this, dir); // need var self = parent.call, blah blah?
    this.require(dir, 'backends'); // need self.require, blah, blah?
    return this;
});

Bones.load(__dirname);