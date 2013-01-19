bones-boiler
============

A boilerplate of tools, examples, and tweaks to Bones to make getting started easier, Bones apps more flexible, and life less annoying for those that want to get started right away. The Bones project was created by the brilliant guys at Development Seed and can be seen here. Bones is a group of conventions for sharing code between a node.js server and a Backbone client for hopefully faster development. 

One of the strengths of Backbone and Bones is flexibility.  They do not try to enforce too much opinion on how you should build your application. This is wonderful for ubiquitous use of the code. But if you're like me and thirst for opinion or inspiration - if it annoys you to do things not directly related to your core product - then this library may be for you.  Fork it, tear it apart, paint it green, whatever.

Features
---

*Model API*

* More flexibility for validation, white-listing, ACL, etc.
* Uses model.url() to define url end point instead of `.../api/<modelName>`. 
* Closer to standard Express workflow, but with Backbone naming conventions.
* Adds Bones.sync method as a standard express handler for writing to a data store.

*Assets*

* Loading node libraries as assets to be served to the client made simpler and more flexible.
* Added assets/main.js and assets/plugins.js as asset end-points to follow html5-boilerplate more closely. 

*Backends*

* Provides Mongoose ORM integration.
* Creates Mongoose models with Backbone model schemas.
* Overwrites Bones.sync to write MongoDB records.  See model API.
* Provides simple structure for writing backend queries and applying them to collections.
* Next up: integrate http://github.com/makara/bones-backend

*Rendering and Templating* 

* Another example of a default send implementation for a server.
* Client and server-side rendering/templating inspired by http://backstage.soundcloud.com/2012/06/building-the-next-soundcloud/
* Allows simple client-side attachment of views to pre-rendered elements from the server.

*Publishing*

* Publish templates for a view and a model. Convenient for using backbone-forms to create a static form for a model.
* Publish a mirror (or all mirrors) to a file(s). Mirror was written to work with a reverse proxy. If you don't have a reverse proxy, publish a static file and you're good to go.

*Utilities*

* Load client, server, and shared folders
* Load custom prefix/suffix files for wrapping other files from `server` and `server/wrappers`
* New wrappers for sending to the client

*Jekyll/Yaml Integration*

* Example of how Jekyll can be used to statically compile templates, which are then loaded into Bones.
* Reads yaml-front-matter property `url` from html files in a specified directory and creates a `GET` end-point for that url and page. 
  * Useful for blogs or info pages like contact information. 
* If you know how to write html, a template, or use Jekyll at all - you can now contribute to Bones

*Miscellaneous*

* Adds `bootstrapList` to `Bones.plugin` - a list of functions executed in parallel that must be completed before starting Bones.
  * Connect to a database before starting the server.
* Removed Bones double csrf protection as default to allow easier use of static forms. Use connect's.

*Libraries*

* Backbone ~0.9.2 *required*
* Underscore ~1.3.3 *required*
* jQuery ~1.7.2 *required*
* node-validator included
* mongoose included
* backbone.marionette 1.0.0-rc2 included
* backbone-forms included

Getting Started
---
* Read Development Seed's documentation on Bones and check out the simple app example.
* Install and launch mongodb.
* Fork and modify.
* Or add as a dependency and add to your application's index.js file `require('bones-boiler')` *after* `require('bones')`
* Modify or override options in `commands/Config.bones.js` with your specific MongoDB instance information
  * Default `localhost:27017/bb`
* Run `npm install`
* Run `node ./index.js`

Why
---

There seem to be three primary schools of thought concerning node.js and sharing Javascript code between the client and server:

* The line of abstraction between client and server is absolute. Implementation of the client and server can freely change without worrying about the other.

* The process on both the client and the server should reflect each other as reasonably as possible. Bones falls into this category in some ways.

* The client and server should share functionality and design patterns, but remain loosely coupled enough to their independent components to change with a little work. The dark and dangerous grey area.

I personally subscribe to the third philosophy. I believe the client/shared/server architecture Bones uses is incredibly powerful. Identifying areas of shared functionality and structure, and then building independent client and server components from that foundation, creates a single core that can be quickly understood while maintaining flexibility.

Examples of shared functionality or structure:

* model schemas

* utility functions or libs

* rendering html

Examples of not shared:

* client: Backbone view event handling and handlers

* server: Access Control Lists for syncing data from a backend

By making use of shared code and using Backbone models as data models between the server and client, a server implementation does not have to tie itself to a single ORM for data modeling. The difficulty then is initializing certain components on the server like Backbone views only to render a model leaves a heavy memory footprint.
 
This project tries to walk the fine line of shared functionality or structure. Hopefully this way, those coming from express can easily understand the server and quickly grasp some Backbone concepts, while those coming from Backbone can easily understand the client and quickly grasp some Express concepts.

Beware: most of this code was just abstracted from a couple different projects, so it's a little rough around the edges :( Hit me up with issues when you get 'em.

How To Use
---
*Bones*

Check the Bones documentation.

*Model API*

The default model API implementation has been replaced with a series of methods closer to an Express workflow. 

In standard Bones, overriding model.sync or Backbone.sync provides the backend CRUD. This has been overridden in favor of use of Bones.sync:

```
    apiHandlers = {
        get:    [build, validate, sanetize, sync, parse, send],
        post:   [build, validate, sanetize, sync, parse, send],
        put:    [build, validate, sanetize, sync, parse, send],
        del:    [build, validate, sync, send]
    };
```

Each function is an Express handler named to follow the design pattern of Backbone:

 *  `build` - instantiate the model
 *  `validate` - reject the request if anything observable is malformed
 *  `sanetize` - sanetize and whitelist values cannot immediately reject (command injection, for example)
 *  `sync` - CRUD operation for the data store
 *  `parse` - parse and format response from CRUD operation (remove passwords from records, etc.)
 *  `send` - deliver response using whatever method (JSON, return, etc.)

Order of precedence follows: options, model, Bones.  So Bones.sync would be replaced by an implemented model.sync express handler, which would be replaced by options.apiHandlers.

Override `servers.Boiler#initializeModelsAndCollections` to provide a different set of default handlers in `options.apiHandlers` for all models. 

See individual method comments for further details and servers/Boiler for more methods.

Methods:

`servers.Boiler#initializeModelsAndCollections(plugin)` takes a plugin instance and creates API end-points for all models.
`servers.Boiler#initializeBackboneApi(backboneModel, options)` takes a Backbone model definition and creates an API end-point if model.url is defined.

Notes:

* Functions like validate and parse, which may have a client-side model implementation, are wrapped by a default express handler if only client-side validate and/or parse are implemented.

*Client, Shared, and Server*

These directories are commonly reserved for code that modifies Bones itself, whether to change or add functionality. This includes prefix and suffix files wrapped around executing code on either the client or the sever.

FAQ

How do I load my fancy server-side changes for Bones?

`Bones.utils.loadServerPlugin(pluginDir)`

```
index.js

Bones.utils.loadServerPlugin(__dirname);
```

How do I load my fancy file wrappers?

`Bones.utils.loadAllWrappers(pluginDir);`

```
index.js

Bones.utils.loadAllWrappers(__dirname);
```

Where can I find my wrappers?

Wrappers are read into `Bones.utils.wrappersServer[<filebasename>]` and `Bones.utils.wrappersClient[<filebasename>]`.

Files ending with `.bones.js` will automatically be wrapped if any prefix or suffix files exist for that kind of file and code location.

How do I use other prefix and suffix for files other than they intended? I just want to wrap my colorize functions like a model!

`utils.aliasWrapperForFile(filename, wrapperName)` creates an alias for `filename` to the prefix and suffix files of `wrapperName` you wish to use.

```
server/wrappers
- backbone-marionette.prefix.js
- backbone-marionette.suffix.js

server/plugin.js

Bones.utils.aliasWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
```

How do I use a wrapper for any file?

If the wrapper has been loaded with the same name of the file, `utils.compileWrapper(module, filename)` will compile the content, prefix, and suffix files into one. Now just require it and will be wrapped. This is automatically done in require for all '.js' files that have had wrappers loaded with the same name.

```
server/wrappers
- backbone-marionette.prefix.js
- backbone-marionette.suffix.js

server/plugin.js

Bones.utils.aliasWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
Bones.Backbone.Marionette = require('backbone.marionette/lib/backbone.marionette.js');
```

Methods:

* `utils.aliasWrapperForFile(filename, wrapperName)` creates an alias for `filename` to the prefix and suffix files of `wrapperName` you with to use.
* `utils.compileWrapper(module, filename)` reads the file into memory and compiles it with the prefix and suffix wrappers.
* `utils.loadWrappers(dir)` loads wrappers from a directory.
* `utils.loadAllWrappers(pluginDir)` loads all wrappers from `pluginDir/<client|server>` and `pluginDir/<client|server>/wrappers`
* `utils.loadServerPlugin(pluginDir)` loads all files in `pluginDir/client` and `pluginDir/shared`.

*Assets*

`servers/Route#assets` stores all arrays of mirrors and/or filepaths to assets to be sent to the client. `servers/Route#initializeAssets` converts these into mirrors and exposes their content at `assets/<mirror>.<type>`

The defaults mirrors are:

* `all.js` all assets in a single file - compiled from [vendor, core, main, plugins]
* `main.js` application code - compiled from [models, templates, views, routers]
* `plugins.js` plugins interacting directly with Bones and/or application code (ie. most files in a client or shared folder).
* `core.js` core functionality on client for Bones, receives no wrapping beyond closure
* `vendor.js` files that do not know of bones at all. plugins like backbone-forms could be added to plugin.js as well.
* `templates.js` all templates.
* `models.js` all models.
* `views.js` all views.
* `routers.js` all routers.

How do I add a file to a mirror?

Augment the initialize method of Route and add to `this.assets.<mirror>` a resolved filepath or use a convenience method below. 

How do I custom wrap my client file? Kind of like a beautiful, one-and-only snowflake I wish to give to the client.

```
Route#initialize()

route.exposeClientPlugin(new mirror([ snowflake ], { type: '.js', wrapper: Bones.utils.wrapSnowflake }));
```

Methods:

* `Route#exposeClientCore(filename)` adds resolved filepath to core.
* `Route#exposeClientVendor(filename)` adds resolved filepath to vendor.
* `Route#exposeClientPlugin(filename)`adds resolved filepath to plugin.
* `Route#loadClientPlugin(pluginDir)` loads all files in `pluginDir/client` and `pluginDir/shared`.
* `Route#loadClientPlugins(Bones.plugin)` loads `/client` and `/shared` for all Bones plugins. Only use if require order irrelevant.
* `utils.wrapClientAll(content)` wraps content with pointers to templates, routers, models, views. To be used with a mirror.
* `utils.wrapClientPlugin(content)` wraps content with pointers to templates, routers, models, views, Bones. To be used with a mirror.

Notes:

* Files in plugins.js are wrapped so they have access to templates, routers, models, views, and Bones itself.
* Mirrors read from the disk every time their url end point is requested. You either need to put a reverse-proxy in front of it, or publish static files as part of your build process. See publishing.

*Rendering and Templating*

Inspired by Soundcloud's engineering: http://backstage.soundcloud.com/2012/06/building-the-next-soundcloud/

Rendering and templating is structured to make use of 'placeholder' elements to provide as much flexibility as possible. This provides a few benefits:

* UI designers do not have to know how Bones or Backbone works to write templates.
* Keeps messy design logic out of Backbone.View#render
* Can render everything server-side for non-Javascript enabled clients - standard Bones
* Can render everything client-side for maximum efficiency - standard Backbone
* Or have the best of both worlds and partially render some content server-side. User then has something to look at while other content and widgets load dynamically

These placeholders are simply divs with certain data attributes depending on whether they're being sent from the server to client or just rendering.

Rendering: `<div data-view="awesomeView" data-id="1">`
Server to client: `<div data-view="awesomeView" data-model="awesomeModel" data-id="__573AB57C">`

The placeholders are generated by 'utils.partial(...)', which places the data passed to partial in a store. This data is later retrieved for rendering the subview using the placeholder's data-id.

Templating should be used server-side and rendering client-side.

`utils.renderSubviews` can then be used to attach simpler Backbone views and models (initialized with only the id from data-id) to server-rendered content on the client (buttons that do not need the complete state of a model, for example). 

For more complex attaching, you can use the method shown in `bones/examples/simple/App.server.bones.js`

See individual function comments in `shared/utils` for more information on each method for now.

FAQ

How do I template my view and its subview?  

Use templateAll with the name of your template and data you'd like to template.

```
servers/popularityApp#index(...)

...
models.Users.getNewestFriends(function(err, users) {
    if (err) return next(err);
    res.locals.main = Bones.utils.templateAll('Index', {
        users: users,
        model: models.User
    });
    return next();
});
```

How do I attach views client-side to server-side rendered content?

```
routers/yourDefaultRouter#initialize(...)

Bones.utils.renderSubviews('body');
```

Methods:

* `utils.partial(view, options, store)` template helper to create a view placeholder element.
* `utils.renderAll(view, options, store)` recursively renders a view and its subviews.
* `utils.renderSubviews(element, store, shouldReplace)` renders views for each placeholder within an element; attaches views if pre-existing content exists within placeholders.
* `utils.templateAll(title, options, store)` recursively templates a view and its subviews.
* `utils.templateSubviews(html, store, selector, shouldReplace)` templates views for each placeholder within a block of html; default leaves place

*Publishing and Commands*

Check Bones documentation and run `node ./index.js --help` to get the basics.

FAQ

How do I write my own command? Where are the arguments to my command?!

Bones reads arguments to your command into `Bones.plugin.config`. Retrieve them from there or use `Bones.Command.extractOptions` to parse them out for you.

```
commands/PublishMirror#initialize(...)

var options = command.extractOptions(command, plugin);
  , mirrorName = options.mirror;
```

Commands:

* `commands.PublishTemplate` given a view and model name, write a template file. Use it with backbone-forms to create form templates for your models. 
* `commands.PublishMirror` given a mirror name writes a content file to a directory. Optional minification. 
* `commands.PublishAllMirrors` writes all mirrors to a directory. Optional minification. 
* `Bones.Command.extractOptions(command, plugin)` returns an object of all the options for a command from Bones.plugin.config.

Notes:

* A command does not run start, so you cannot count on any functions you've place in Bones.plugin.boostrapList to run before hand.
 
Testing
---
Requires mocha. See dev-dependencies in package.json. Run `npm test` from bones-boiler root.

License
---
Same as bones. BSD licensed.
