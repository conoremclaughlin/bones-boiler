var fs    = require('fs')
  , path  = require('path')
  , Bones = require(global.__BonesPath__ || 'bones')
  , utils = Bones.utils;

/**
 * Load the wrapper files (*.prefix.js or *.suffix.js) from a directory
 * credit to @makara and github.com/markara/bones for the code.
 *
 * @param {String} wrapperDir to read wrappers from.
 * @returns {Object} of prefix and suffix wrappers.
 */
utils.loadWrappers = function(wrapperDir) {
    var wrappers = {};
    if (!fs.existsSync(wrapperDir)) return false;
    fs.readdirSync(wrapperDir).forEach(function(name) {
        var match = name.match(/^(.+)\.(prefix|suffix)\.js$/);
        if (match) {
            wrappers[match[1]] = wrappers[match[1]] || {};
            wrappers[match[1]][match[2]] =
            fs.readFileSync(path.join(wrapperDir, name), 'utf8');
        }
    });
    return wrappers;
};

/**
 * Create or extend wrappers objects for both the client and server.
 * Load any wrappers from server, server/wrappers, or client directories
 * into the appropriate object.
 *
 * @param {String} pluginDir of a plugin's index.js
 */
utils.loadAllWrappers = function(pluginDir) {
    utils.wrappersServer = utils.wrappersServer || {};
    utils.wrappersClient = utils.wrappersClient || {};
    utils.wrappersServer = _.extend(utils.wrappersServer, utils.loadWrappers(path.join(pluginDir, 'server')));
    utils.wrappersServer = _.extend(utils.wrappersServer, utils.loadWrappers(path.join(pluginDir, 'server/wrappers')));
    utils.wrappersClient = _.extend(utils.wrappersClient, utils.loadWrappers(path.join(pluginDir, 'client')));
};

/**
 * Map from Backbone CRUD to HTTP.
 */
utils.methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
};

/**
 * Register an alias for a pre-existing wrapper.
 *
 * @param {String} filename to create an alias with.
 * @param {String} wrapper name of pre-existing wrapper.
 */
utils.aliasWrapperForFile = function(filename, wrapper) {
    filename = require.resolve(filename);
    utils.wrappersServer[filename] = utils.wrappersServer[wrapper];
};

/**
 * Compile a file with its prefix and suffix files and load into a module.
 * Note: uses an internal node.js method, so beware over reliance.
 *
 * @param {Object} module to load with the file.
 * @param {String} filename path of resolved file.
 */
utils.compileWrapper = function(module, filename) {
    var wrapper = utils.wrappersServer[filename];
    var content = fs.readFileSync(filename, 'utf8');
    if (!content) console.error('unable to read file: ', filename);

    if (wrapper && content) {
        if (wrapper.prefix) content = wrapper.prefix + ';' + content;
        if (wrapper.suffix) content += '\n;' + wrapper.suffix;
        module._compile(content, filename);
    }
};

/**
 * Wrap content to be sent to the client with necessary
 * references to models, views, routers, templates.
 *
 * @param {String} content to wrap.
 * @returns {String} of wrapped content.
 */
utils.wrapClientAll = function(content) {
    return "Bones.initialize(function(models, views, routers, templates) {"
        + content
        + "});";
};

/**
 * Wrap content to be sent to the client with necessary
 * references to models, views, routers, templates, and Bones itself.
 *
 * @param {String} content to wrap.
 * @returns {String} of wrapped content.
 */
utils.wrapClientPlugin = function(content) {
    return "Bones.initialize(function(models, views, routers, templates, Bones) {"
        + content
        + "});";
};

/**
 * Require all non-prefix/suffix files in ./shared and ./server folders
 * into memory.
 *
 * @param {String} pluginDir of a plugin's index.js.
 */
utils.loadServerPlugin = function(pluginDir) {
    var directories = ['shared', 'server'];
    directories.forEach(function(dir) {
        var directory = path.join(pluginDir, dir);
        var files = [];

        // read directory and filter out non-files and prefixes/suffixes.
        if (!fs.existsSync(directory)) return;
        files = fs.readdirSync(directory);
        files = _.reject(files, function(file) {
            var isNotFile = fs.statSync(path.join(directory, file)).isDirectory();
            isNotFile = isNotFile || file.match(/^(.+)\.(prefix|suffix)\.js$/);
            return isNotFile;
        });

        // looks okay, load the file.
        _.each(files, function(file) {
            require(path.join(directory, file));
        });
    });
};

// Expose __line as a global property to aid with debugging.
Object.defineProperty(global, '__stack', {
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){ return stack; };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function(){
        return __stack[1].getLineNumber();
    }
});

