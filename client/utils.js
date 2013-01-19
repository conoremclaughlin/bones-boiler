(function() {
    // Set up Backbone 0.9.2 with jQuery
    Backbone.setDomLibrary($);

    // Add bones to the argument list of client-side functions so it can be accessed.
    Bones.initialize = _.wrap(Bones.initialize, function(parent, kind, callback) {
        if (_.isFunction(kind)) {
            kind = _.wrap(kind, function(parent) {
                var args = Array.prototype.slice.call(arguments, 1);
                args.push(Bones);
                parent.apply(this, args);
            });
        }
        return parent.call(this, kind, callback);
    });
}).call(this);