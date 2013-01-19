var Bones = require(global.__BonesPath__ || 'bones')
  , _ = Bones._
  , async = require('async');


Bones.Server.augment({
    start: function(parent, callback) {
        // TODO: change from singleton structure or push into the start command,
        // but no perceived benefit beside cleaner decoupling.
        if (Bones.plugin.bootstrapList && Bones.plugin.bootstrapList.length > 0) {
            async.parallel(Bones.plugin.bootstrapList, function(err, results) {
                if (err) throw new Error('CRITICAL ERROR - PRE-FLIGHT TASK FAILED - ABORTING START: ', err);
                return parent.call(this, callback);
            }.bind(this));
        } else {
            return parent.call(this, callback);
        }
    }
});