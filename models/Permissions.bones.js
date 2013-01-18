
/**
 * Temporary container for methods dealing with permissions.
 * TODO: expand into separate lib, investigate acl of lock and let go.
 */

model = Backbone.Model.extend({});

/**
 * Allow only properties specified by a schema and whitelisted methods.
 * No methods specified for a field defaults to 'all.' Flexibility over
 * safety. My computer security professor would be upset.
 *
 * @param {Object} object to parse and filter.
 * @param {Object} schema to use for filtering.
 * @param {String} method of HTTP request to filter for.
 * @returns {Object} of filtered properties.
 */
model.filter = function(object, schema, method) {
    var filtered = {};
    _.each(_.keys(schema), function(key) {
        if (object[key] &&              // if the object possesses the key from the schema AND
                (!key.methods ||        // if there is no method validation OR the HTTP method is permitted
                (key.methods && _.indexOf(key.methods, method) !== -1))) {
            filtered[key] = object[key];
        }
    });
    return filtered;
};

/**
 * Recursively parses the permissions from a model schema.
 * Stores the property paths as hash keys for O(1) look-ups.
 *
 * @param {String} currentPath descended to this point in the schema.
 * @param {Object} schema to parse permissions from.
 * @param {Object} permissions object adding property paths to.
 * @returns {boolean} executed parsing?
 */
model.parseSchemaPermissions = function(currentPath, schema, permissions) {
    if (schema === null || !_.isObject(schema)) return false;
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
                models.Permissions.parseSchemaPermission(currentPath + '.' + key, key.type, permissions);
            };
        }
    });
    return true;
};

/**
 * Sets static permissions for properties within a model.
 * Looks for read, create, etc. under model.[...].key.methods
 * and adds them to the appropriate method hash to later be used for
 * whitelisting CRUD methods.
 *
 * @param {Object} model's Backbone static definition.
 * @returns {Object} set of CRUD permission paths.
 */
model.parsePermissions = function(model) {
    // start from the root of the schema.
    models.Permissions.parseSchemaPermissions('', model.prototype.dbSchema, model.prototype.permissions);
    return model.prototype.permissions;
};