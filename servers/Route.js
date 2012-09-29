var path = require('path');
var fs = require('fs'), path = require('path'), middleware = require('express'), env = process.env.NODE_ENV
        || 'development';

server = Bones.Server.extend( {});
// TODO: add the app object and some easy way to apply the default template
// (some way to specify it as a root?)
// If webapps will be embedded in a page like google maps, hmm......

// TODO: create a command to initialize new paths while the server is running.
servers.Route.prototype.initializeStaticYaml = function(app) {
    app.directories.forEach(function(dir) {
        // only use Sync version at initialization (blocking)
        // read the directories with a default base path of _site (else check
        // options)
        var page = fs.readFileSync(path.join(dir, 'package.json'),
                'utf8'));
        // add the jekyll permalink url as a path.
        // check whether it needs to be added as static or processed through the
        // template add.
        this.use('/assets/' + pkg.name, middleware['static'](path.join(dir,
                'assets'), {
            maxAge : env === 'production' ? 3600 * 1000 : 0
        } // 1 hour
        ));
    }, this);
    // read whether the
};

servers.Route.prototype.initializeStatic = function(app) {
    this.initializeStaticYaml.call(this);
};

// Augment.
servers.Route.augment( {
    initialize : function(parent, app) {
        parent.call(this, app);
        this.initializeStatic();
        // Register pages.
    }
});