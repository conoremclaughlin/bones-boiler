var Bones = require(global.__BonesPath__ || 'bones');

require('./server/utils');

// TODO: include in Bones.plugin.load wrapper, but
// small chance can break things if other plugin writers
// not disciplined enough.
Bones.utils.loadServerPlugin(__dirname);

/*require('./shared/utils');
require('./server/plugin');

// Override bones.sync and backbone.sync methods with mongoose handlers.
require('./server/backbone');

// Add pre-flight task queue to the start of a server.
require('./server/server');
*/

// Form extends View so add forms to the views folder
Bones.Backbone.Form = require('backbone-forms/distribution/backbone-forms');

// What is going on here.
Bones.utils.registerWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
Bones.Backbone.Marionette = require('backbone.marionette/lib/backbone.marionette.js');

Bones.Backend = require('./server/backend');
Bones.plugin.backends = {};

Bones.plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    parent.call(this, dir);
    this.require(dir, 'backends');
    return this;
});

Bones.load(__dirname);