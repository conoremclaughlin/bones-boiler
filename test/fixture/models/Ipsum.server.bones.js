var store = {};

models['Ipsum'].prototype.sync = function(method, model, options) {
    options || (options = {});
    var success = options.success, error = options.error;

    var id = model.get('name') || null;
    if (!id) return error('Name is required');

    if (method === 'read') {
        return store[id] ? success(store[id]) : error('Model not found.');
    } else if (method === 'create' || method === 'update') {
        store[id] = model.toJSON();
    } else if (method === 'delete') {
        delete store[id];
    }
    success(store[id] || {});
};
