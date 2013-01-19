#!/usr/bin/env node

var path = require('path')
  , bonesPath = global.__BonesPath__ || 'bones'
  , Bones = require(bonesPath);

// use utils to conveniently load everything else.
require('./server/utils');
Bones.utils.loadServerPlugin(__dirname);

// mongoose query backends inherit from mongoose
require('./backends/Mongoose');

Bones.load(__dirname);

if (!module.parent) {
    Bones.start();
}