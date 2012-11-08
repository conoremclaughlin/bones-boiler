var Bones = require(global.__BonesPath__ || 'bones');
var _ = Bones._;
var async = require('async');
var Server = Bones.Server;

Bones.Server.augment({
    start: function(parent, callback) {
        // TODO: change from singleton structure or push into the start command,
        // but no perceived benefit besides cleaner object-oriented decoupling.
        if (Bones.plugin.preflightTaskList && Bones.plugin.preflightTaskList.length > 0) {
            async.parallel(Bones.plugin.preflightTaskList, function(err, results) {
                if (err) throw new Error('ERROR - CRITICAL PRE-FLIGHT - ABORTING START: ', err);
                return parent.call(this, callback);
            }.bind(this));
        } else {
            return parent.call(this, callback);
        }
    }
});