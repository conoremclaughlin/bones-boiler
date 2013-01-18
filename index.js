#!/usr/bin/env node

var path = require('path')
  , bonesPath = global.__BonesPath__ || 'bones'
  , Bones = require(bonesPath);

Bones.Backbone.setDomLibrary(Bones.$);

require('./server/utils');

Bones.utils.loadAllWrappers(path.join(require.resolve(bonesPath), '..'));

// TODO: include in Bones.plugin.load wrapper, but
// small chance can break things if other plugin writers
// not disciplined enough.  Move this to plugin.load to load Bones modifications.
Bones.utils.loadServerPlugin(__dirname);

// Form extends View so add forms to the views folder
Bones.Backbone.Form = require('backbone-forms/distribution/backbone-forms');

// What is going on here.
// TODO: push into plugin or utils mayhaps.
Bones.utils.registerWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
Bones.Backbone.Marionette = require('backbone.marionette/lib/backbone.marionette.js');

Bones.Backend = require('./server/backend');

Bones.plugin.load = _.wrap(Bones.plugin.load, function(parent, dir) {
    this.loadCompiled(dir);
    this.require(dir, 'backends');
    parent.call(this, dir);
    return this;
});

require('./backends/Mongoose');

Bones.load(__dirname);

if (!module.parent) {
    // TODO: would a pre-flight here be useful? Before initialization?
    Bones.start();
}