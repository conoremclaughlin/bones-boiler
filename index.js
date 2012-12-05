var Bones = require(global.__BonesPath__ || 'bones');

// Form extends View so add forms to the views folder
Bones.Backbone.Form = require('backbone-forms/distribution/backbone-forms');

require('./server/utils');

// Override bones.sync and backbone.sync methods.
require('./server/backbone');

// Add pre-flight task queue to the start of a server.
require('./server/server');

Bones.Backend = require('./server/backend');

// Load backends directory.
Bones.plugin.backends = {};
Bones.plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    parent.call(this, dir);
    this.require(dir, 'backends');
    return this;
});

Bones.load(__dirname);