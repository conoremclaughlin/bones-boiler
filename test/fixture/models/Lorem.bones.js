model = models.Base.extend({
    schema: {
        name:       { type: 'Text', validators: ['required'] },
        country:    { type: 'Select', options: ['USA', 'China'], validators: ['required'] },
        created:    { type: 'Date', validators: ['required'] },
        location:   { type: 'Text' }
    }
});