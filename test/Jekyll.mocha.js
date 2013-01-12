require('./fixture');
var bonesTest = require('bones-test');
var server = bonesTest.server();
var debug = require('debug')('bones-boiler:Jekyll.mocha');
var request = require('request');
var should = require('should');

describe('Jekyll Server', function() {
    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        try { server.close(done); }
        catch (err) { } // server already closed.
    });

    it('should add a pages object to plugin to store static pages', function(done) {
        server.plugin.should.have.property('pages').and.be.a('object');
        done();
    });

    it('should have added fixure/templates/compiled/test.html into pages', function(done) {
        server.plugin.pages.should.have.property('test');
        done();
    });

    it('should read the frontmatter and create a get handler for the page from the url property', function(done) {
        request.get({
            uri: 'http://127.0.0.1:3000/test',
        }, function(err, res, body) {
            should.not.exist(err);
            res.should.be.a('object');
            res.should.have.property('statusCode', 200);
            done();
        });
    });

    it('should add fixture/templates/compiled/templates into the templates object', function(done) {
        server.plugin.templates.should.have.property('App');
        done();
    });
});
