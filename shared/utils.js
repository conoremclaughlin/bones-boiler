// TODO: hate this require structure. Please change. Should this be utils?
var debug = '';
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    var Bones = require(global.__BonesPath__ || 'bones');
    module.exports = Bones.utils;
    debug = require('debug')('bones-boiler:utils');
} else {
    debug = console.log;
}

console.log('Bones: ', Bones);

var Bones = Bones || {};
var utils = Bones.utils = Bones.utils || {};
console.log('utils: ', utils);
var $ = Bones.$ || $;
var templates = templates || Bones.plugin.templates;
console.log('templates: ', templates);
var models = models || Bones.plugin.models;

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    module.exports = Bones.utils;
}

/**
 * Parses information about the subview from the data-id of the div.view
 * and renders if needed, otherwise attach a view if rendered on the server.
 * Finally, replaces the element of the placeholder div.view element with the
 * new view (rendered or just attached).
 *
 * @param element to have its subviews rendered.
 * @param [selector] selects and parses an element from the DOM.
 * @returns element with newly rendered subviews.
 */
utils.renderSubviews = function renderSubviews(element, store, shouldReplace) {
    var view    = '',
        model   = '';

    element = _.isString(element) ? $(element) : element;
    element.$('div[data-view^=""]').each(function() {
        options = (store && $(this).attr('data-id') && store[$(this).attr('data-id')])
                ? store[$(this).attr('data-id')]
                : {};

        // If there's a data-model, we must be attaching, check the data-id and assign.
        // Overwrites model if it's in options.model
        if ($(this).attr('data-model')) {
            model = options.model ? options.model : {};
            if ($(this).attr('data-id')) {
                model.id = $(this).attr('data-id');
            }
            model = new models[$(this).attr('data-model')](model);
            options.model = model;

            // TODO: clarify collision behavior for data-ids sent from the server
            // versus the temporary object counter
            if ($(this).attr('data-id')) {
                model.id = $(this).attr('data-id');
            }
        }

        view = new views[$(this).attr('data-view')](options);

        // render if no content, else move the html to the view
        if (!$(this).children[0]) {
            view.renderAll ? view.renderAll(store) : utils.renderAll(view, store);
        } else {
            // TODO: what to do here if we use outerHtml? use the selector?
            view.html($(this).html());
        }

        if (shouldReplace) {
            $(this).replaceWith(view.el);
        } else {
            $(this).html(view.html());
        }
        // TODO: store the allocated view or use a Factory for both view and model?
    });
    // TODO: how do we return the views? store them?
    return element;
};

utils.renderAll = function(view, store) {
    if (!view.render) return false;
    store = store || utils.makeStore();
    view.render();
    return utils.renderSubviews(view.el, store);
},

/**
 * Use templates to directly render subviews. Data-id hashes must have view names
 * with corresponding templates of the same name.
 *
 * @param html string to parse and render subviews.
 * @param {String} [selector] disregards html and selects a DOM element to iterate. Client-side only.
 * @param {Object} [store]
 * @param {boolean} [replace] the subview placeholder element rather than add templated html.
 * @returns a rendered string of html.
 */
utils.templateSubviews = function templateSubviews(html, store, selector, shouldReplace) {
    var options = {},
        element = selector ? $(selector) : $('<div/>').html(html);

    debug('debug html: ', element.html());
    // XXX: I think this selector is wrong, need to fix this somehow.
    var elements = $('div[data-view^=""]', element);
    debug('elements: ', elements);
    $('div[data-view^=""]', element).each(function() {

//        if ($(this).attr('data-model') && models[$(this).attr('data-model')]) {
//            var model = new models[$(this).attr('data-model')]();
//        }
//        debug('this: ', this);
//        debug('this html: ', $(this).html());

        options = (store && $(this).attr('data-id')) ? store[$(this).attr('data-id')] : {};
//        debug('subviews : data-view name: ', $(this).attr('data-view'));
        html = utils.templateAll($(this).attr('data-view'), options, store);
//        debug('subviews : data-view html: ', html);
        if (shouldReplace) {
            debug('replacing');
            $(this).replaceWith(html);
        } else {
            $(this).html(html);
            debug('[templateSubviews] not replacing.');
            if (options && options.model && (options.model.id || options.model._id)) {
                var id = options.model.id || options.model._id;
                $(this).attr('data-id', id);
            } else {
                $(this).removeAttr('data-id');
            }
        }
    });
    return element.html();
};

/**
 * Without initializing any view objects, renders the template, recursively its subviews.
 * Requires a view have a template with the same name.
 *
 * @param title of the template to render.
 * @param data object to pass to the template.
 * @returns {String} of rendered html
 */
utils.templateAll = function templateAll(title, options, store) {
    // store will be accessed here in order to retrieve the data
    store = store || utils.makeStore();
    options = options || {};
    _.extend(options, {
        partial: utils.makePartialHelperWithStore(store)
    });
    debug('title: ', title);
    debug('options: ', options);
    return utils.templateSubviews(templates[title](options), store);
};

/**
 * What if I want to pass in data to the view to be rendered? template blah, blah
 * Problem: the problem right now are worries about collision, what if ids of this kind show, etc.
 */
utils.partial = function(view, options, store) {
    var title   = '',
        id      = '',
        html    = '<div',
        options = options || {},
        model   = {};

//    if (options.toObject) {
//        debug('******* options.toObject exists! *******');
//    }

//    // i'm sure they have their reasons
//    options = options.toObject ? options.toObject() : options;
    debug('options: ', options);
    // XXX: should replace doesn't add data-model if it exists?
    if (options.model) {
        // guess at what the model name may be:
        // string, Backbone instance/class, Mongoose model/collection name)
        model = options.model;
        title = _.isString(model) ? model : model.title || model.constructor.title || model.modelName || utils.singularize(model.collection.name);

        // if title is defined, add data-model attribute
        if (title) {
            html += ' data-model="' + title + '"';
        }
        debug('model.constructor.title: ', model.constructor.title);
        debug('model.title: ', title);
        debug('model.modelName: ', model.modelName);
        debug('model.model: ', model.model);
        debug('model.schema: ', model.schema);
        debug('model.collection: ', model.collection);
    }

    if (store) {
        // non-blocking so should be okay here right since stores are only accessible by its request?
        // TODO: confirm concurrency-safe
        id = store.nextId();

        // is it a document/model? or just an object?
        //store[id] = options.toObject ? options.toObject() : options;
        store[id] = options;
        html += ' data-id="' + id + '"';
    }

    title = _.isString(view) ? view : view.title || view.constructor.title;
    html += ' data-view="' + title + '"';
    html += '></div>';
    return html;
};

/**
 * .
 */
utils.makePartialHelperWithStore = function(store) {
    return function(view, options) {
        return utils.partial(view, options, store);
    };
};

/**
 * .
 */
utils.makeStore = function() {
    var id = 0;
    return {
        nextId: function() {
            var newId = id;
            id++;
            return newId;
        }
    };
};

/**
 * If on the server, use templates to render. If on the client, instantiate
 * a view and render it and its subviews.
 *
 * @param view class
 * @param model object
 * @returns html if on the server, view pointer if client.
 */
utils.sharedRender = function sharedRender(view, options) {
    // TODO: add data.
    options = options || {};
    if (Bones.server) {
        return _.templateAll(view, options);
    } else {
        var v = new view(options);
        v.renderAll();
        return v;
    }
};

/**
 * Gets url whether it's a property or function.
 *
 * @param {Object} object with a url property or function
 * @returns {String} url
 */
utils.getUrl = function(object) {
    if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
    return _.isFunction(object.url) ? object.url() : object.url;
};

/**
 * @see: http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
 */
utils.checkNested = function(obj /*, level1, level2, ... levelN*/) {
    var args    = Array.prototype.slice.call(arguments),
        obj     = args.shift(),
        i       = 0;

    for (i = 0; i < args.length; i++) {
        if (!obj.hasOwnProperty(args[i])) return false;
        obj = obj[args[i]];
    }
    return true;
};

/**
 * Credit to: backbone-forms for this method.
 * Gets a nested attribute using a path e.g. 'user.name'
 *
 * @param {Object} obj    Object to fetch attribute from
 * @param {String} path   Attribute path e.g. 'user.name'
 * @return {Mixed}
 * @api private
 */
utils.getNested = function(obj, path) {
    var fields = path.split(".");
    var result = obj;
    for (var i = 0, n = fields.length; i < n; i++) {
        result = result[fields[i]];
    }
    return result;
};

utils.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};