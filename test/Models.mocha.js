process.env.NODE_ENV = 'test';
require('./fixture');

var debug = require('debug')('bones-boiler:Models.mocha')
  , bonesTest = require('bones-test')
  , server = bonesTest.server()

// Test data.
var data = {
    name: 'First'
};

before(function(done) {
    server.plugin.config.mongoHost = 'localhost';
    server.plugin.config.mongoName = 'bb-test';
    done();
});

after(function(done) {
    var plugin = server.plugin;
    plugin.backends.Mongoose.dropDatabase(plugin.config.mongoHost + '/' + plugin.config.mongoName, function(err) {
        done(err);
    });
});

describe('Models', function() {

    describe('Base', function() {
        var model;

        before(function(done) {

            model = new server.plugin.models.Base();
            server.start(done);
        });

        after(function(done) {
            try { server.close(done); }
            catch (err) { } // server already closed.
        });

        it('should have a url /api/<title> with no id', function(done) {
            model.url().should.be.equal('/api/base');
            done();
        });

        it('should have a url /api/<title>/:id with a set id', function(done) {
            model.id = 'cool';
            model.url().should.be.equal('/api/base/cool');
            done();
        });

        bonesTest.testModel(server, 'Lorem');
    });

    describe('BaseCollection', function() {
        it('should have db as a property', function(done) {
            var collection = new server.plugin.models.BaseCollection();
            collection.should.have.property('db').and.be.a('function');
            done();
        });
    });

});

describe('Models', function() {
    bonesTest.testModelCRUDHTTP(server, 'Lorem', data, {
        name: 'another name'
    });
});