bones-boiler
============

A boilerplate of tools, examples, and tweaks to Bones to make getting started easier, Bones apps more flexible, and life less annoying for those that want to get started right away. The [Bones](https://github.com/developmentseed/bones) project was created by the brilliant guys at Development Seed. It is a group of conventions for sharing code between a node.js server and a Backbone client for hopefully faster development. 

One of the strengths of Backbone and Bones is flexibility.  They do not try to enforce too much opinion on how you should build your application. This is wonderful for ubiquitous use of a library. But if you're like me and thirst for opinion or inspiration - if it annoys you to wade through stuff not directly related to your core product - then this library may be for you.  Fork it, tear it apart, paint it green, whatever.

**Beware:** most of this code was just abstracted from a couple different projects, so it's a little rough around the edges :( I love issues so please make them.

Features
---

**Model API**

* More flexibility for validation, white-listing, ACL, etc.
* Uses model.url() to define url end point instead of `.../api/<modelName>`. 
* Closer to standard Express workflow, but with Backbone naming conventions.
* Adds Bones.sync method as a standard express handler for writing to a data store.

**Assets**

* Loading node libraries as assets to be served to the client made simpler and more flexible.
* Added assets/main.js and assets/plugins.js as asset end-points to follow html5-boilerplate more closely. 

**Backends**

* Provides Mongoose ORM integration.
* Creates Mongoose models with Backbone model schemas.
* Overwrites Bones.sync to write MongoDB records. See Model API.
* Provides simple structure for writing backend queries and applying them to collections.
* Next up: integrate http://github.com/makara/bones-backend

**Rendering and Templating**

* Another example of a default send implementation for a server.
* Client and server-side rendering/templating inspired by http://backstage.soundcloud.com/2012/06/building-the-next-soundcloud/
* Allows simple client-side attachment of views to pre-rendered elements from the server.

**Publishing and Commands**

* Publish templates for a view and a model. Convenient for using backbone-forms to create a static form for a model.
* Publish a mirror (or all mirrors) to a file(s). Mirror.js was written to work with a reverse proxy. If you don't have a reverse proxy, publish a static file.

**Utilities**

* Load client, server, and shared folders
* Load custom prefix/suffix files for wrapping other files from `<plugin>/<client|server>` and `<plugin>/<client|server>/wrappers`
* New wrappers for sending to the client

**Jekyll/Yaml Integration**

* Example of how Jekyll can be used to statically compile templates, which are then loaded into Bones.
* Reads yaml-front-matter property `url` from html files in a specified directory and creates a `GET` end-point for that url and page. 
  * Useful for blogs or info pages like contact information. 
* If you know how to write html, a template, or use Jekyll at all - you can now contribute to a Bones project.

**Miscellaneous**

* Adds `bootstrapList` to `Bones.plugin` - a list of functions executed in parallel that must be completed before starting the Bones server.
  * Connect to a database before starting the server.
* Removed Bones double csrf protection as default to allow easier use of static forms. Use connect's.

**Libraries**

Pushing bones-boiler to be additive, so just remove the dependencies and features of whatever you don't need.

* bones ~2.4.0 *required*
* Backbone ~0.9.2 *required*
* Underscore ~1.3.3 *required*
* jQuery ~1.7.2 *required*
* async included - bootstraping start of server/testing
* yaml-front-matter included - jekyll
* express-validator included - validation and sanetizing
* mongoose included - ORM backend solution
* backbone.marionette 1.0.0-rc2 included - fancy Backbone
* backbone-forms included - forms

Getting Started
---

1. Read Development Seed's [documentation](https://github.com/developmentseed/bones) on Bones and check out the simple app example under examples.
2. Install and launch mongodb.
3. Retrieve project.
  * Fork, clone, modify.
  * Or add as a dependency and add to your application's index.js file `require('bones-boiler')` after `require('bones')`
4. Modify or override options in `commands/Config.bones.js` with your specific MongoDB instance information
  * Default `localhost:27017/bb`
5. Run `npm install`
6. From the `bones-boiler` directory, run:
```
rm -rf node_modules/bones/node_modules/backbone node_modules/bones/node_modules/jquery node_modules/bones/node_modules/mirror
```
to delete bones' backbone, jquery, and mirror dependency folders so bones-boiler can use its own versions.
7. Run `node ./index.js`

Testing
---
Requires mocha. See dev-dependencies in package.json. Run `npm test` from bones-boiler root.

How To Use
---
### Bones

Some tips beyond the original documentation.

Models, views, routers, templates, servers, and commands folders each hold the core *.bones.js files.  These files are then wrapped with *.prefix.js and *.suffix.js before they are executed on either the client or server.  Bones chooses what *.prefix.js and *.suffix.js files are used to wrap the core files depending on where the code will be executed.  If it's the server, node.js requires can be seen in the prefix file while client's will hold the beginning of a closure. This is how Bones provides conventions for declaration:

```
model.prefix.js

...
var model;
```
```
MyModel.bones.js

model = new Bones.Backbone.Model({});
```

Otherwise you are just building a Backbone application on the client and building an Express application on the server (with some Backbone code mixed in).
 
## Model API

The default model API implementation has been replaced with a series of methods closer to an Express workflow. 

In standard Bones, overriding model.sync or Backbone.sync in a *.server.bones.js file provides the backend CRUD. This has been overridden in favor of Bones.sync:

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

Order of precedence follows: options, model, Bones.  So Bones.sync would be replaced by an implemented model.serverSync express handler, which would be replaced by options.apiHandlers.

Override `servers.Boiler#initializeModelsAndCollections` to provide a different set of default handlers in `options.apiHandlers` for all models. 

See individual method comments for further details and `bones-boiler/servers/Boiler` for more methods.

### Methods

* `servers.Boiler#initializeModelsAndCollections(plugin)` takes a plugin instance and creates API end-points for all models.
* `servers.Boiler#initializeBackboneApi(backboneModel, options)` takes a Backbone model definition and creates an API end-point if model.url is defined.

### Notes

* Default uses model.serverSync instead of model.sync because we cannot differentiate between a client-side sync and an express handler.
* Functions like validate and parse, which may have a client-side model implementation, are wrapped by a default express handler if only client-side validate and/or parse are implemented.

## Client, Shared, and Server Code

`client`, `shared`, and `server` directories are commonly reserved for code that modifies Bones itself, whether to change or add functionality. This includes prefix and suffix files wrapped around executing code on either the client or the sever.

### Methods

* `utils.aliasWrapperForFile(filename, wrapperName)` creates an alias for `filename` to the prefix and suffix files of `wrapperName` you with to use.
* `utils.compileWrapper(module, filename)` reads the file into memory and compiles it with the prefix and suffix wrappers.
* `utils.loadWrappers(dir)` loads wrappers from a directory.
* `utils.loadAllWrappers(pluginDir)` loads all wrappers from `pluginDir/<client|server>` and `pluginDir/<client|server>/wrappers`
* `utils.loadServerPlugin(pluginDir)` loads all files in `pluginDir/client` and `pluginDir/shared`.
* `utils.wrapClientAll(content)` wraps content with pointers to templates, routers, models, views. To be used with a mirror.
* `utils.wrapClientPlugin(content)` wraps content with pointers to templates, routers, models, views, Bones. To be used with a mirror.

### How To

**How do I load my fancy server-side changes for Bones?**

`Bones.utils.loadServerPlugin(pluginDir);`

```
index.js

Bones.utils.loadServerPlugin(__dirname);
```

**How do I load my fancy file wrappers?**

`Bones.utils.loadAllWrappers(pluginDir);`

```
index.js

Bones.utils.loadAllWrappers(__dirname);
```

**Where can I find my wrappers?**

Wrappers are read into `Bones.utils.wrappersServer[<filebasename>]` and `Bones.utils.wrappersClient[<filebasename>]`.

Files ending with `.bones.js` will automatically be wrapped if any prefix or suffix files exist for that kind of file and code location.

**How do I use other prefix and suffix for files other than they intended? I just want to wrap my colorize functions like a model!**

`utils.aliasWrapperForFile(filename, wrapperName)` creates an alias for `filename` to the prefix and suffix files of `wrapperName` you wish to use.

```
$ ls server/wrappers
backbone-marionette.prefix.js
backbone-marionette.suffix.js

server/plugin.js

Bones.utils.aliasWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
```

**How do I use a wrapper for any file?**

If the wrapper has been loaded with the same name of the file, `utils.compileWrapper(module, filename)` will compile the content, prefix, and suffix files into one. Now just require it and will be wrapped. This is automatically done in require for all '.js' files that have had wrappers loaded with the same name.

```
$ ls server/wrappers
backbone-marionette.prefix.js
backbone-marionette.suffix.js

server/plugin.js

Bones.utils.aliasWrapperForFile('backbone.marionette/lib/backbone.marionette.js', 'backbone-marionette');
Bones.Backbone.Marionette = require('backbone.marionette/lib/backbone.marionette.js');
```

**How do I custom wrap a file I want to send to the client? It's kind of like a beautiful, one-and-only snowflake I wish to give to the client.**

Create a mirror with the file and the wrapper as an option. Please see **Assets** for further info on exposing files to the client.

```
Route#initialize()

route.exposeClientPlugin(new mirror([ snowflake ], { type: '.js', wrapper: Bones.utils.wrapSnowflake }));
```

## Assets

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

### Methods

* `Route#exposeClientCore(filename)` adds resolved filepath to core.
* `Route#exposeClientVendor(filename)` adds resolved filepath to vendor.
* `Route#exposeClientPlugin(filename)`adds resolved filepath to plugin.
* `Route#loadClientPlugin(pluginDir)` loads all files in `pluginDir/client` and `pluginDir/shared`.
* `Route#loadClientPlugins(Bones.plugin)` loads `/client` and `/shared` for all Bones plugins. Only use if require order irrelevant.

### Notes

* Files in plugins.js are wrapped so they have access to templates, routers, models, views, and Bones itself.
* Mirrors read from the disk every time their url end point is requested. You either need to put a reverse-proxy in front of it, or publish static files as part of your build process. See publishing.

### How To

**How do I add a file to a mirror?**

Augment the initialize method of Route and add to `this.assets.<mirror>` a resolved filepath or use a convenience method below. 

## Rendering and Templating

Inspired by Soundcloud's [engineering](http://backstage.soundcloud.com/2012/06/building-the-next-soundcloud/)

Rendering and templating is structured to make use of 'placeholder' elements to provide as much flexibility as possible. This provides a few benefits:

* UI designers do not have to know how Bones or Backbone works to write templates.
* Keeps messy design logic out of Backbone.View#render
* Can render everything server-side for non-Javascript enabled clients - standard Bones
* Can render everything client-side for maximum efficiency - standard Backbone
* Or have the best of both worlds and partially render some content server-side. User then has something to look at while other content and widgets load dynamically

These placeholders are simply divs with certain data attributes depending on whether they're being sent from the server to client or just rendering.

* Rendering: `<div data-view="awesomeView" data-id="1">`

* Server to client: `<div data-view="awesomeView" data-model="awesomeModel" data-id="__573AB57C">`

The placeholders are generated by `utils.partial(...)`, which places the data passed to partial in a store. This data is later retrieved for rendering the subview using the placeholder's data-id.

`utils.renderSubviews` can then be used to attach simpler Backbone views and models (initialized with only the id from data-id) to server-rendered content on the client (buttons that do not need the complete state of a model, for example). For more complex attaching, you can use the method shown in `bones/examples/simple/App.server.bones.js`

See individual function comments in `shared/utils` for more information on each method.

### Notes

* Templating should be used server-side and rendering client-side for ideal behavior.

### Methods

* `utils.partial(view, options, store)` template helper to create a view placeholder element.
* `utils.renderAll(view, options, store)` recursively renders a view and its subviews.
* `utils.renderSubviews(element, store, shouldReplace)` renders views for each placeholder within an element; attaches views if pre-existing content exists within placeholders.
* `utils.templateAll(title, options, store)` recursively templates a view and its subviews.
* `utils.templateSubviews(html, store, selector, shouldReplace)` templates views for each placeholder within a block of html; default leaves place

### How To

**How do I template my view and its subview?**

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

**How do I attach views client-side to server-side rendered content?**

```
routers/yourDefaultRouter#initialize(...)

Bones.utils.renderSubviews('body');
```

## Publishing and Commands

Check Bones [documentation](https://github.com/developmentseed/bones/wiki/Commands) and run `node ./index.js --help` to get the basics.

### Commands

* `commands.PublishTemplate` given a view and model name, write a template file. Use it with backbone-forms to create form templates for your models. 
* `commands.PublishMirror` given a mirror name writes a content file to a directory. Optional minification. 
* `commands.PublishAllMirrors` writes all mirrors to a directory. Optional minification. 
* `Bones.Command.extractOptions(command, plugin)` returns an object of all the options for a command from Bones.plugin.config.

### Notes

* A command does not run start, so you cannot count on any functions you've place in Bones.plugin.boostrapList to run before hand.

### How To

How do I write my own command? Where are the arguments to my command?!

Bones reads arguments to your command into `Bones.plugin.config`. Retrieve them from there or use `Bones.Command.extractOptions` to parse them out for you.

```
commands/PublishMirror#initialize(...)

var options = command.extractOptions(command, plugin);
  , mirrorName = options.mirror;
```

Client/Shared/Server Philosophy
---

There seem to be three primary schools of thought concerning node.js and sharing Javascript code between the client and server:

* The line of abstraction between client and server is absolute. Implementation of the client and server can freely change without worrying about the other.

* The process on both the client and the server should reflect each other as reasonably as possible. Bones falls into this category in some ways.

* The client and server should share functionality and design patterns, but remain loosely coupled enough to their independent components to change with a little work. The dark and dangerous grey area.

I personally subscribe to the third philosophy. I believe the client/shared/server architecture Bones uses is incredibly powerful. Identifying areas of shared functionality and structure, and then building independent client and server components from that foundation, creates a single core that can be quickly understood while maintaining flexibility.

Examples of shared functionality or structure:

* model JSON schemas

* utility functions or libs

* rendering html

Examples of not shared:

* client: Backbone view event handling and handlers

* server: Access Control Lists for syncing data from a backend

By making use of shared code and using Backbone models as data models between the server and client, a server implementation does not have to tie itself to a single ORM for data modeling. However, certain components contain functionality irrelevant to the server. Backbone views used to only render a model leave a heavy memory footprint, for example.
 
This project tries to walk the fine line of shared functionality or structure. Hopefully this way, those coming from express can easily understand the server and quickly grasp some Backbone concepts, while those coming from Backbone can easily understand the client and quickly grasp some Express concepts.

Credits
---
Development Seed

Wiredcraft

@makara

License
---
Same as bones. [BSD licensed](https://github.com/conoremclaughlin/bones-boiler/raw/master/LICENSE).