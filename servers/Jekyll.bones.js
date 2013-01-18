var fs = require('fs')
  , path = require('path')
  , _ = Bones._
  , yaml = require('yaml-front-matter')
  , debug = require('debug')('bones-boiler:page');

/**
 * TODO: add the app object and some easy way to apply the default template
 * (some way to specify it as a root?)
 * If webapps will be embedded in a page like google maps, hmm......
 */
server = servers.Base.extend();

/**
 * TODO: add a check to see if any conflicts between dynamic and static
 * handlers.
 * Augment to add static pages availability from the root path.
 */
server.prototype.initialize = function(app) {
    _.bindAll(this, 'initializeStaticPages', 'makePageHandler');
    this.initializeStaticPages(app, 'templates/source/pages');
    return this;
};

/**
 * Return a handler to send the rendered page.
 */
server.prototype.makePageHandler = function(page) {
    // TODO: add an app object to store the root level view.
    // TODO: app object also needs to store the Main router.
    // Render the page once.
    return function loadPage(req, res, next) {
        // TODO: set logged-in user or whatever.
        // TODO: set up a handle to just send the static page as well.
        res.locals.template = templates.Page;
        res.locals.main = Bones.plugin.pages[page].content;
        return next();
    };
};

/**
 * Override this for custom static-page directory structures.
 * TODO: create a command to initialize new paths while the server is running.
 */
server.prototype.initializeStaticPages = function(app, pages) {
    var self = this;
    var pagesPath = '';
    var files = [];
    var front = '';
    app.directories.forEach(function(dir) {
        debug('exposing static jekyll pages for dir: ', dir);

        // read directory and filter out non-files.
        pagesPath = path.join(dir, pages);
        if (!fs.existsSync(pagesPath)) { return false; }
        files = fs.readdirSync(pagesPath);
        files = _.reject(files, function(file) {
            return fs.statSync(path.join(pagesPath, file)).isDirectory();
        });

        // read yaml front matter of each file and expose a get if a front-matter has a url property.
        _.each(files, function(file) {
            front = yaml.loadFront(path.join(pagesPath, file), file);
            if (front.url) {
                self.get(front.url, self.makePageHandler(path.basename(file, '.html')), self.send);
            }
        });
    });
};
