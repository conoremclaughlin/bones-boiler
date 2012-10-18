var Bones = require('bones');
var fs = require('fs');
var path = require('path');

// TODO: Make this a command. Seems a bit clunky as is.
// Create softlinks to any template directories so the static rendering process
// can access them.
console.log('adding bones-boiler');
Bones.load(__dirname);