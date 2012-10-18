var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var express = require('express');
var yaml = require('yaml-front-matter');
var env = process.env.NODE_ENV || 'development';

// TODO: add the app object and some easy way to apply the default template
// (some way to specify it as a root?)
// If webapps will be embedded in a page like google maps, hmm......

// Override this to add
servers.Route.prototype.initializeStaticDir = function(link, path) {
    // Add static handler if page marked as complete.
    // TODO: switch to mirror for serving static assets
    // but we have no reverse proxy....
    this.get(link, express['static'](path, {
        maxAge : env === 'production' ? 3600 * 1000 : 0
    }));
};

// TODO: create a command to initialize new paths while the server is running.
// Override this for custom directory structures.
servers.Route.prototype.initializeStaticPages = function(app) {
    // Grab everything before and after the YAML front matter.
    app.directories.forEach(function(dir) {
        console.log('dir: ', dir);
        // only can use sync version here at initialization (blocking).
        // read the directories with a default base path of _site (else
        // check options)
        var fileList = fs.readdirSync(dir);
        fileList = _.reject(fileList, function(file) {
            return fs.statSync(file, function(err, stats) {
                return stats.isDirectory();
            });
        });

        _.each(fileList, function(file) {
            var fileName = path.basename(file);
            var front = yaml.loadFront(file, path.basename(file));
            // Must specify standard Jekyll permalink for now.
            if (front.url) {
                this.get(front.url, servers.Page.page(fileName), servers.Page.send);
                // if return a page before it hits the static serving of the
                // root directory.
            }
        });
    }, this);
};

// TODO: add a check to see if any conflicts between dynamic and static
// handlers.

// Augment to add static pages availability from the root path.
servers.Route.augment({
    initialize : function(parent, app) {
        parent.call(this, app);
        this.initializeStaticPages(app);
        this.initializeStaticDir('/', 'templates/compiled/public');
    }
});