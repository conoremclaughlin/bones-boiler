// *************************** REGRESSION ***************************
// 1. test if Bones.sync has been set from Bones.plugins.backends.Mongoose.sync
// 2.


// ***************************** TESTS ******************************

require('./fixture');

var _ = require('underscore');
var bonesTest = require('bones-test');

var server = bonesTest.server();
// TODO: change how to require server.

// Test data.
var data = {
    name: 'First'
};

describe('Model API:', function() {
    bonesTest.utils.initStart(server);

    describe('mongoose', function() {

        it('should be a backend', function(done) {
            server.plugin.backends.should.be.a('object');
            server.plugin.backends.should.have.property('Mongoose');
            done();
        });

        it('should initialize and store db models in plugin.app', function(done) {
            server.plugin.should.have.property('app').should.be.a('object');
            server.plugin.app.should.have.property('mongooseModels').should.be.a('object');
            done();
        });

        it('should replace Bones.sync with Mongoose.sync', function(done) {
            var Bones = require(global.__BonesPath__ || 'bones');
            try {
                Bones.sync({}, {}, function(err) {
                    // no model in req argument, so should call next with error.
                    if (err) done();
                });
            } catch(err) {
                return done(err);
            }
        });
    });

    describe('base models', function() {
        var model = new server.plugin.models.Base();
        it('should have a url /api/<title> with no id', function(done) {
            model.url().should.be.equal('/api/base');
            setTimeout(done, 0.5);
        });

        it('should have a url /api/<title>/:id with a set id', function(done) {
            model.set('id', 'cool');
            server.plugin.url().should.be.equal('/api/base/cool');
            setTimeout(done, 0.5);
        });
    });

    describe('cc-core models', function() {
        console.log('Point: ', server.plugin.models.Point);
        bonesTest.testModel(server, 'Point');
        bonesTest.testModelCRUDHTTP(server, 'Point', data, {
            name: 'another name'
        });
        /*_.each(server.plugin.models, function(model){
            bonesTest.testModel(server, model.constructor.title);
            bonesTest.testModelCRUD(server, model.constructor.title, data, {
                name: 'another name'
            });
            bonesTest.testModelCRUDHTTP(server, model.constructor.title, data, {
                name: 'another name'
            });
        });*/
    });
});