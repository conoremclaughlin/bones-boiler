// TODO: hate this require structure. Please change. Push into a wrapper for shared files?
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    var Bones = require(global.__BonesPath__ || 'bones');
    var debug = require('debug')('bones-boiler:utils');
    module.exports = Bones.utils;
} else {
    var debug = console.log;
}

// TODO: Move this to a prefix and suffix wrapper for shared files
var Bones = Bones || {}
  , utils = Bones.utils || {}
  , templates = templates || Bones.plugin.templates
  , models = models || Bones.plugin.models
  , views = views || Bones.plugin.views;

/**
 * Parses rendering and initialization info from the data attributes of
 * any element with the attribute data-view. Only attaches a view if a
 * element already has inner html, assuming it was sent by the server and was
 * already rendered. By default replaces the element of the placeholder div[data-view]
 * with the new view (rendered or attached). If rendering on the server and want
 * to maintain the data-views for client-side attaching, for example, shouldReplace
 * needs to be false.
 *
 * @param {Mixed} element string to select/instantiate or jQuery element to select on.
 * @param {Object} [store] to retrieve rendering arguments from.
 * @param {boolean} [shouldReplace] the div[data-view] with Backbone views. Default true.
 * @returns {Object} created views.
 */
utils.renderSubviews = function renderSubviews(element, store, shouldReplace) {
    var view = '',
        model = '',
        created = {},
        viewSelector = Bones.server ? 'div[data-view^=""]' : 'div[data-view]';

    shouldReplace = (shouldReplace === undefined) ? true : shouldReplace;
    element = _.isString(element) ? $(element) : element;

    $(viewSelector, element).each(function() {
        var viewType = $(this).attr('data-view');
        var options = (store && $(this).attr('data-id') && store[$(this).attr('data-id')])
                    ? store[$(this).attr('data-id')]
                    : {};

        // If there's a data-model, we must be attaching, check the data-id and assign.
        // Overwrites model if it's in options.model
        if ($(this).attr('data-model')) {
            model = options.model ? options.model : {};
            model = new models[$(this).attr('data-model')](model);
            options.model = model;

            if ($(this).attr('data-id')) {
                model.id = $(this).attr('data-id');
            }
        }

        view = new views[viewType](options);
        created[viewType] = created[viewType] ? created[viewType].push(view) : [ view ];

        // attach if content, else fresh top-down rendering, so render
        if (this.children.length > 0) {
            view.$el.html($(this).html());
        } else {
            // TODO: what to do here if we use outerHtml? use the selector?
            utils.renderAll(view, store);
        }

        // should replace is the default for rendering, because
        // it should be used primarily client-side.
        if (shouldReplace) {
            $(this).replaceWith(view.$el);
        } else {
            $(this).html(view.html());
        }
        // TODO: store the allocated view or use a Factory for both view and model?
    });
    return created;
};

/**
 * Without initializing any view objects, renders the template, and
 * recursively its subviews. Requires a view have a template with the same name.
 *
 * @param {Object} backbone view instance.
 * @param {Object} [options] to pass to the optional template.
 * @param {Object} [store] to maintain rendering data.
 * @returns {Object} of newly created views.
 */
utils.renderAll = function(view, options, store) {
    store = store || utils.makeStore();
    options.partial = utils.makePartialHelperWithStore(store);
    view.render ? view.render() : view.$el.html(templates[view.constructor.title](options));
    return utils.renderSubviews(view.el, store);
},

/**
 * Parses rendering and initialization info from the data attributes of
 * any element with the attribute data-view. Templates subviews and replaces
 * the data-id of a div[data-view] with a model's id if model.id was set
 * when it was passed to utils.partial.
 *
 * @param {String} html to parse and template subviews.
 * @param {Object} [store] to retrieve rendering arguments from.
 * @param {String} [selector] to optionally retrieve an element from the DOM.
 * @param {boolean} [shouldReplace] the div[data-view] with Backbone views. Default false.
 * @returns {String} html, templated nice and new.
 */
utils.templateSubviews = function templateSubviews(html, store, selector, shouldReplace) {
    var options = {},
        element = selector ? $(selector) : $('<div/>').html(html),
        viewSelector = Bones.server ? 'div[data-view^=""]' : 'div[data-view]';

    $(viewSelector, element).each(function() {
        options = (store && $(this).attr('data-id')) ? store[$(this).attr('data-id')] : {};
        html = utils.templateAll($(this).attr('data-view'), options, store);
        if (shouldReplace) {
            $(this).replaceWith(html);
        } else {
            $(this).html(html);
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
 * Without initializing any view objects, renders the template, and
 * recursively its subviews. Requires a view have a template with the same name.
 *
 * @param {String} title of the template to render.
 * @param {Object} [options] to pass to the template.
 * @param {Object} [store] to maintain rendering data.
 * @returns {String} html, templated nice and new.
 */
utils.templateAll = function templateAll(title, options, store) {
    store = store || utils.makeStore();
    options = options || {};
    _.extend(options, {
        partial: utils.makePartialHelperWithStore(store)
    });
    return utils.templateSubviews(templates[title](options), store);
};

/**
 * Helper function to be used inside ERB templates.
 * It stores data given to it and creates placeholder elements
 * to later be replaced with the proper template or rendered view.
 * Allows clean abstraction between the view layer - templates - and
 * the control layer - a view's event handlers and rendering method.
 * UI designers can specify exactly where they wish a partial template to be.
 *
 * @see http://backstage.soundcloud.com/2012/06/building-the-next-soundcloud/
 * @param {Mixed} view string title, view instance, or view backbone definition.
 * @param {Object} [options] data to store.
 * @param {Object} [store] to hold the data.
 * @returns {String} html of placeholder  element.
 */
utils.partial = function(view, options, store) {
    var title   = '',
        id      = '',
        html    = '<div',
        options = options || {},
        model   = {};

    if (options.model && Bones.server) {
        // guess name: string, Backbone instance/class, Mongoose model/collection name)
        model = options.model;
        // XXX: find a way to include model name rather than derive from collection.
        title = _.isString(model)
                ? model
                : model.title
                || model.constructor.title
                || model.modelName;
        title = !title && model.collection
                ? utils.capitalizeFirstLetter(utils.singularize(model.collection.name))
                : title;

        // if title is defined, add data-model attribute
        if (title) {
            html += ' data-model="' + title + '"';
        }
    }

    if (store) {
        // non-blocking so should be okay here right since stores are only accessible by its request?
        // TODO: confirm concurrency-safe
        id = store.nextId();
        store[id] = options;
        html += ' data-id="' + id + '"';
    }

    title = _.isString(view) ? view : view.title || view.constructor.title;
    html += ' data-view="' + title + '"';
    html += '></div>';
    return html;
};

/**
 * Make closure for the utils.partial so it has access to a store
 * and a less crowded prototype.
 *
 * @param {Object} store to invoke utils.partial with.
 * @returns {Function} wrapper for utils.partial(store, ...)
 */
utils.makePartialHelperWithStore = function(store) {
    return function(view, options) {
        return utils.partial(view, options, store);
    };
};

/**
 * Makes a store with #nextId() for storing temporary data.
 *
 * @returns {Object} store with a nextId fn.
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
 * If server, use templates to render. If client, instantiate
 * a view and render it and its subviews.
 *
 * @param {Mixed} view name or Backbone definition.
 * @param {Object} options to pass to rendering.
 * @returns {Mixed} html or view pointer.
 */
utils.sharedRender = function sharedRender(view, options) {
    // TODO: add data.
    options = options || {};
    if (Bones.server) {
        return utils.templateAll(view, options);
    } else {
        var v = new view(options);
        v.renderAll();
        return v;
    }
};

/**
 * Gets url from a model whether it's a property or function.
 *
 * @param {Object} object with a url property or function
 * @returns {String} url
 */
utils.getUrl = function(object) {
    if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
    return _.isFunction(object.url) ? object.url() : object.url;
};

/**
 * Checks object for whether a nested property key exists.
 *
 * @see: http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
 * @returns {boolean} property exists?
 */
utils.checkNested = function(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments)
      , obj = args.shift()
      , i = 0;

    for (i = 0; i < args.length; i++) {
        if (!obj.hasOwnProperty(args[i])) return false;
        obj = obj[args[i]];
    }
    return true;
};

/**
 * Credit to @powmedia and powmedia/backbone-forms for this method.
 * Gets a nested attribute using a path e.g. 'user.name'
 *
 * @param {Object} obj    Object to fetch attribute from
 * @param {String} path   Attribute path e.g. 'user.name'
 * @return {Mixed} result
 */
utils.getNested = function(obj, path) {
    var fields = path.split(".");
    var result = obj;
    for (var i = 0, n = fields.length; i < n; i++) {
        result = result[fields[i]];
    }
    return result;
};

/**
 * Capitalizes first letter of a string.
 *
 * @param {String} string to capitalize.
 * @returns {String} string capitalized.
 */
utils.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};