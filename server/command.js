var Bones = require(global.__BonesPath__ || 'bones')
  , _ = Bones._;

Bones.Command.extractOptions = function(command, plugin) {
    var options = {};
    var keys = _.keys(command.options);
    keys.forEach(function(key) {
        if (plugin.config[key]) options[key] = plugin.config[key];
    });
    return options;
};