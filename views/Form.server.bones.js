var debug = require('debug')('bones-boiler:form');
// Give Form all the special goodies of servers-side views.
// TODO: check if safe to use _.extend instead of assigning
views.Form.register = Backbone.View.register;
views.Form.toString = Backbone.View.toString;
debug('ADDING VIEWS TO Backbone.Form: ', Backbone.Form);