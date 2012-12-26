var utils = require('bones').utils;
var fs = require('fs');

utils.wrappersServer = _.extend(utils.wrappersServer, utils.loadWrappers(__dirname));
utils.wrappersServer = _.extend(utils.wrappersServer, utils.loadWrappers(__dirname + '/node_modules'));

require.extensions['.js'] = _.wrap(require.extensions['.js'], function(parent, module, filename) {
    utils.compileWrapper(module, filename);
    return parent.call(this, module, filename);
});