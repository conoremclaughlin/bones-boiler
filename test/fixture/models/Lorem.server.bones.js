var store = {};

model = models.Lorem;

model.prototype.dbSchema = model.dbSchema = {
    name:       'String',
    country:    'String',
    created:    'Date',
    location:   'String',
    serverOnly: { type: ['Oid'], method: ['put'] }
};