var store = {};

model = models.Lorem;

model.prototype.sync = function(method, model, options) {
    options || (options = {});
    var success = options.success, error = options.error;

    var id = model.get('id') || null;
    if (!id) return error('ID is required');

    if (method === 'read') {
        return store[id] ? success(store[id]) : error('Model not found.');
    } else if (method === 'create' || method === 'update') {
        store[id] = model.toJSON();
    } else if (method === 'delete') {
        delete store[id];
    }
    success(store[id] || {});
};

model.prototype.dbSchema = model.dbSchema = {
    name:       'String',
    country:    'String',
    created:    'Date',
    location:   'String',
    serverOnly: { type: ['Oid'], method: ['put'] }
};