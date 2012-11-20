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

/**
 * Globally expose url helper from inside bones model sync.
 */
utils.getUrl = function(object) {
    if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
    return _.isFunction(object.url) ? object.url() : object.url;
};

/**
 * @see: http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
 */
utils.checkNested = function(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments),
        obj = args.shift();

    for (var i = 0; i < args.length; i++) {
        if (!obj.hasOwnProperty(args[i]))
            return false;
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