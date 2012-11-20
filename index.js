var Bones = require(global.__BonesPath__ || 'bones');

// Add Backbone.Form server-side, Form extends View so add forms to the views folder
Bones.Backbone.Form = require('backbone-forms/distribution/backbone-forms');

// Add some nice utils methods and properties.
require('./server/utils');

// Override bones.sync and backbone.sync methods.
require('./server/backbone');

// Add pre-flight task queue to the start of a server.
require('./server/server');

// Load and expose Backend class in bones.
// TODO: now see makara has done similar work for @bones-backend,
//       add as dependency and make pull requests including further functionality.

Bones.Backend = require('./server/backend');

// Add backends to plugin and automatically load from directory.
Bones.plugin.backends = {};

// Wrap load to include the backends directory as well.
// XXX: may have problems here with this pointer. *shakes fist at javascript*
Bones.plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    parent.call(this, dir);
    this.require(dir, 'backends');
    return this;
});

// Load me.
Bones.load(__dirname);