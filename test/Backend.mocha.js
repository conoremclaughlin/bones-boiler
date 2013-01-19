process.env.NODE_ENV = 'test';

require('./fixture');

var debug = require('debug')('bones-boiler:Backend.mocha')
  , bonesTest = require('bones-test')
  , Bones = require('bones')
  , server = bonesTest.server();

describe('Backend', function() {
    var plugin
      , Backend = Bones.Backend;

    before(function(done) {
        server.start(done);
        plugin = server.plugin;
    });

    after(function(done) {
        try { server.close(done); }
        catch (err) { } // server already closed.
    });

    it('should be a class object within Bones', function(done) {
        Bones.should.have.property('Backend');
        done();
    });

    it('should add a backends object to plugin', function(done) {
        plugin.should.have.property('backends').and.be.a('object');
        done();
    });

    it('should have a static extendWithPre function', function(done) {
        Backend.should.have.property('extendWithPre').and.be.a('function');
        done();
    });

    it('should have a static toString function', function(done) {
        Backend.should.have.property('toString').and.be.a('function');
        done();
    });

    describe('.extendWithPre', function() {
        var test = [1, 2];
        var pre = function(parent) {
            return parent.call(this, test);
        };
        var queries = {
            hello: function(micCheck) {
                return micCheck;
            },
            encore: function(micCheck) {
                micCheck.push(3);
                return micCheck;
            }
        };
        var queriesAfter = {};

        it('should wrap all functions in an object with a "pre" function', function(done) {
            queriesAfter = Backend.extendWithPre(queriesAfter, queries, pre);
            queriesAfter.hello().should.have.length(2);
            queriesAfter.encore().should.have.length(3);
            done();
        });
    });
});
