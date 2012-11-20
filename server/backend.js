var Bones = require(global.__BonesPath__ || 'bones');
var Backbone = Bones.Backbone;
var _ = require('underscore');

module.exports = Backend;

function Backend(plugin, callback) {
    this.bootstrap(plugin, function() {
        this.initialize(plugin, callback);
    }.bind(this));
};

Backend.augment = Backbone.Router.augment;
Backend.extend = Backbone.Router.extend;

Backend.toString = function() {
    return '<Backend ' + this.title + '>';
};

Backend.prototype.bootstrap = function(plugin, callback) {
    callback();
};

Backend.prototype.initialize = function(plugin, callback) {};

Backend.prototype.toString = function() {
    return '[Backend ' + this.constructor.title + ']';
};
/**
 * What else does a backend commonly need? A method to create a query (whitelisting, blacklisting, JSON parsing?, defaults)
 * TODO: Change the naming, but keeping it for now for legacy reasons.
 */
Backend.prototype.query = function(query) {

};

/**
 * A method to execute a query and call the backend driver.
 * TODO: Throw error or something if not implemented, keeping as mixin for legacy reasons.
 */
Backend.prototype.sync = function(req, res, next) {

};

/**
 * A method to parse and render the results for returning to the server and/or client (items, _.pick, timestamp, etc.).
 * TODO: Same.  Keeping for legacy reasons until a better solution can be found.
 */
Backend.prototype.parse = function(result) {

};

