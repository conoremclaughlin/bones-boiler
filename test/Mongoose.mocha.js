process.env.NODE_ENV = 'test';
require('./fixture');

var Bones = require(global.__BonesPath__ || 'bones')
  , _ = Bones._
  , bonesTest = require('bones-test')
  , server = bonesTest.server()

// Write to a test database.
// TODO: write an uninstall method for the test database.

describe('Mongoose', function() {

    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        try { server.close(done); }
        catch (err) { } // server already closed.
    });

    it('should be a backend', function(done) {
        server.plugin.backends.should.be.a('object');
        server.plugin.backends.should.have.property('Mongoose');
        done();
    });

    it('should initialize and store db models in plugin', function(done) {
        server.plugin.should.have.property('mongooseModels').should.be.a('object');
        done();
    });

    it('should replace Bones.sync with Mongoose.sync', function(done) {
        try {
            Bones.sync({}, {}, function(err) {
                // no model in req argument, so should call next with error.
                if (err) done();
            });
        } catch(err) {
            return done(err);
        }
    });

    it('should make a wrapper to add a connection object to a functions arguments', function(done) {
        function checkConnection(connection, query) {
            query.should.equal('hello');
            arguments.should.have.length(2);
            done();
        }
        var wrapper = server.plugin.backends.Mongoose.makeGetConnection('Lorem');
        var wrapped = _.wrap(checkConnection, wrapper);
        wrapped('hello');
    });

    describe('.mixinQueries', function() {
        it('should mixin queries with the getConnection plugin', function(done) {
            var model = server.plugin.models.Lorems;
            server.plugin.backends.MonEnumerable.mixinQueries(model);
            model.should.have.property('getLatest').and.be.a('function');
            done();
        });
    });
});