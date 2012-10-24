// weird path, but this is their npm install so what are you going to do.....
var Form = require('backbone-forms/distribution/backbone-forms');

// give Form all the special goodies of Bones server views.
// don't trust an extend to not break something, so need to do it manually or use filter.
Form.register = Backbone.View.register;
Form.toString = Backbone.View.toString;
Form.prototype.make = Backbone.View.prototype.make;

Form.setTemplates({
    submitForm: '<form class="submit">{{fieldsets}}<input type="submit"></form>'
});

view = Form.extend();