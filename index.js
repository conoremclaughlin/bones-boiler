var path = require('path');
var bonesPath = global.__BonesPath || 'bones';
var Bones = require(bonesPath);

require('./server/utils');

Bones.utils.loadAllWrappers(path.join(require.resolve(bonesPath), '..'));

// TODO: include in Bones.plugin.load wrapper, but
// small chance can break things if other plugin writers
// not disciplined enough.  Move this to plugin.load to load Bones modifications.
Bones.utils.loadServerPlugin(__dirname);

// Form extends View so add forms to the views folder
Bones.Backbone.Form = require('backbone-forms/distribution/backbone-forms');

// What is going on here.
Bones.utils.registerWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
Bones.Backbone.Marionette = require('backbone.marionette/lib/backbone.marionette.js');

Bones.Backend = require('./server/backend');

Bones.plugin.backends = {};

Bones.plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    this.require(dir, 'backends');
    parent.call(this, dir);
    return this;
});

require('./backends/Mongoose');

Bones.load(__dirname);