var debug = require('debug')('bones-boiler:BaseCollection');

collection = models.BaseCollection;

collection.augment({
    initialize: function(parent, app) {
        parent.call(this, app);
        if (!Bones.plugin.db) debug('initialize - no backend available.');
        if (Bones.plugin.mongooseModels) {
            this.db = Bones.plugin.mongooseModels[this.model.title];
        }
        return this;
    }
});