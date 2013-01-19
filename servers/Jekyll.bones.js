var fs = require('fs')
  , path = require('path')
  , _ = Bones._
  , yaml = require('yaml-front-matter')
  , debug = require('debug')('bones-boiler:page');

/**
 * Jekyll takes jekyll-style directories and exposes their static content
 * as either stand-alone pages or templates to be used later. Files can be sent
 * either directly via the assets server or run through boiler templates
 * to add logged-in users, etc.
 *
 * Default actions:
 *  load bones-boiler/templates/compiled/templates into Bones.plugin.templates
 *  load bones-boiler/templates/compiled/pages into Bones.plugin.pages
 *  read bones-boiler/templates/source/pages and expose GET page.frontMatter['url']
 */

server = servers.Base.extend();

server.prototype.initialize = function(app) {
    _.bindAll(this, 'initializeStaticPages', 'makePageHandler');
    this.initializeStaticPages(app, 'templates/source/pages');
    // TODO: add assets.pages to allow retrieval of static pages.

    return this;
};

/**
 * Return a handler to set the boiler template
 * and load the content of the page.
 *
 * @param {String} page name to be loaded.
 * @returns {Function} loadPage to prepare pages.
 */
server.prototype.makePageHandler = function(page) {
    // Closure to tie the url to the page content.
    return function loadPage(req, res, next) {
        res.locals.template = templates.Page;
        res.locals.main = Bones.plugin.pages[page].content;
        return next();
    };
};

/**
 * Loads static yaml-front-matter from source directory's html files
 * and uses each filename as a key to retrieve any content loaded from
 * the compiled directory @see server/plugin.loadCompiled and create
 * a get handler for the content at the url specified by the yaml property 'url'.
 *
 * @param {Object} app plugin for Bones.
 * @param {String} pagesDir - relative module path to the directories in each plugin.
 */
server.prototype.initializeStaticPages = function(app, pagesDir) {
    var self = this
      , pagesPath = ''
      , files = []
      , front = '';

    app.directories.forEach(function(dir) {
        debug('exposing static jekyll pages for dir: ', dir);

        // read directory and filter out non-files.
        pagesPath = path.join(dir, pagesDir);
        if (!fs.existsSync(pagesPath)) { return false; }
        files = fs.readdirSync(pagesPath);
        files = _.reject(files, function(file) {
            return fs.statSync(path.join(pagesPath, file)).isDirectory();
        });

        // read yaml front matter of each file and expose a get if a front-matter has a url property.
        _.each(files, function(file) {
            front = yaml.loadFront(path.join(pagesPath, file), file);
            if (front.url && app.pages[path.basename(file, '.html')]) {
                self.get(front.url, self.makePageHandler(path.basename(file, '.html')), self.send);
            }
        });
    });
    // TODO: add a check to warn of any conflicts between dynamic and static content handlers.
};
