process.env.NODE_ENV = 'test';

require('./fixture');
var bonesTest = require('bones-test');

// TODO: change how to require server.
var server = bonesTest.server();
server.plugin.config.mongoName += '-test';

// Test data.
var data = {
    name: 'First'
};

describe('Models', function() {
    describe('base models', function() {
        before(function(done) {
            server.start(done);
        });

        after(function(done) {
            server.on('close', done);
            try { server.close(); }
            catch (err) { done();  } // server already closed.
        });

        var model = new server.plugin.models.Base();
        it('should have a url /api/<title> with no id', function(done) {
            model.url().should.be.equal('/api/base');
            done();
        });

        it('should have a url /api/<title>/:id with a set id', function(done) {
            model.set('id', 'cool');
            server.plugin.url().should.be.equal('/api/base/cool');
            done();
        });

        bonesTest.testModel(server, 'Lorem');
    });

    bonesTest.testModelCRUDHTTP(server, 'Lorem', data, {
        name: 'another name'
    });
});