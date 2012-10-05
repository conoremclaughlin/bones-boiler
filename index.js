var fs = require('fs');
var path = require('path');

// TODO: Make this a command. Seems a bit clunky as is.
// Create softlinks to any template directories so the static rendering process
// can access them.
Bones.plugin.augment({
    require : function(dir, kind) {
        if (kind === 'templates') {
            fs.exists(path.join(dir, kind), function(object) {
                var root = Bones.plugin.config.root ? Bones.plugin.config.root : '/pages/_layouts';
                try {
                    fs.exec('ln -s ' + path.join(root, path.basename(dir)) + ' ' + path.join(dir, kind));
                } catch (err) {
                    console.log('[ERROR plugin.require] ', err);
                    throw err;
                }
            });
        }
        parent.call(this, dir, kind);
    }
});