var Bones = require(global.__BonesPath__ || 'bones')
  , _ = Bones._;

/**
 * Extract and return the necessary arguments for a command
 * from Bones.plugin.config.
 *
 * @param {Object} command static class definition.
 * @param {Object} plugin to parse options from.
 * @returns {Object} options filtered from plugin.config.
 */
Bones.Command.extractOptions = function(command, plugin) {
    var options = {};
    var keys = _.keys(command.options);
    keys.forEach(function(key) {
        if (plugin.config[key]) options[key] = plugin.config[key];
    });
    return options;
};