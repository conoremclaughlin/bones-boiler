var Bones = require(global.__BonesPath__ || 'bones');

var $ = Bones.$, jQuery = $;
var _ = Bones._;
var Backbone = Bones.Backbone;

var models = Bones.plugin.models;
var commands = Bones.plugin.commands;
var backends = Bones.plugin.backends;

var backend;