// Give Form all the special goodies of servers-side views.
// TODO: check if safe to use _.extend instead of assigning
Backbone.Form.register = Backbone.View.register;
Backbone.Form.toString = Backbone.View.toString;
Backbone.Form.prototype.make = Backbone.View.prototype.make;