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

### Bones-Boiler

* [Assets](https://github.com/conoremclaughlin/bones-boiler/wiki/Assets)

* [Client, Shared, and Server Code](https://github.com/conoremclaughlin/bones-boiler/wiki/Client,-Shared,-and-Server-Code)

* [Model API](https://github.com/conoremclaughlin/bones-boiler/wiki/Model-API)

* [Publishing and Commands](https://github.com/conoremclaughlin/bones-boiler/wiki/Publishing-and-Commands)

* [Rendering and Templating](https://github.com/conoremclaughlin/bones-boiler/wiki/Rendering-and-Templating)

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