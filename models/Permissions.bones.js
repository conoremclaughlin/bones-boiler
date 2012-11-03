// Container now for methods dealing with permissions.
// Will be expanded later to integrate with other ACL libraries.
// TODO IMPORTANT: think of that one dude that had the simple acl of lock and let go.
model = Backbone.Model.extend({});

// Have a headache right now. :(
// Allow only fields specified by the schema or whitelisted methods.
// No methods specified for a field defaults to 'all' (need flexibility over safety, here)
model.filter = function(object, schema, method) {
    var filtered = {};
    _.each(_.keys(schema), function(key) {
        if (key.type && key.methods && _.indexOf(key.methods, method) === -1) { return false; }
        filtered[key] = object[key];
    });
    return filtered;
};

// STATIC return a regular schema without the permissions associated.
model.getSchema = function(schema) {
    _.each(_.keys(schema), function(key) {
        if (key.type && key.methods && _.indexOf(key.methods, method) === -1) { return false; }
        filtered[key] = object[key];
    });
    return filtered;
};

// STATIC sets static permissions for properties within a model.
// Looks for read, create, etc. under model.[...].key.methods
// and adds them to the appropriate method hash to later be used for
// whitelisting CRUD methods.
// TODO: write tests.
model.parsePermissions = function(model) {
    Bones.utils.parseSchemaPermissions('', model.prototype.dbSchema, model.prototype.permissions);
    return model.prototype.permissions;
};

// STATIC Recursive function to parse the permissions from a model schema.
// stores the paths as hash keys for O(1) look-ups.  Filtering is going to be called
// for every model request or update.
// TODO: write tests.
model.parseSchemaPermissions = function(currentPath, schema, permissions) {
    if (schema === null) { return false; }
    _.each(_.keys(schema), function(key) {
        if (key.type) {
            // if any methods to filter, update the permissions paths.
            if (key.methods) {
                _.each(key.methods, function(method) {
                    permissions[method][currentPath + '.' + key] = null;
                });
            }
            // if type is a subschema, update the current path and recurse.
            if (_.isObject(key.type)) {
                Bones.utils.parseSchemaPermission(currentPath + '.' + key, key.type, permissions);
            };
        }
    });
    return true;
};