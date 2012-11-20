require('./fixture');

var bonesTest = require('bones-test');
var server = bonesTest.server();

// Custom
var testUtils = require('../lib/test-utils');

var data = {
    name: '',
    gender: '',
    birthday: '',
    number: 5
};

describe('Test-utils functions', function() {
    describe('dummyModel()', function() {
        it('should return dummy data for a server and model', function(done) {
            done('implement me!');
        });
    });

    describe('dummyObject()', function() {
        it('should return dummy data for each key of an object', function(done) {
            var dummy = testUtils.dummyObject(data);
            dummy.should.have.property('name').should.equal('initial name');
            dummy.should.have.property('gender').should.equal('initial gender');
            dummy.should.have.property('birthday').should.equal('initial birthday');
            done();
        });
    });
});
