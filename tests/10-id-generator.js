/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
 /* globals describe, before, after, it, should, beforeEach, afterEach */
 /* jshint node: true */
'use strict';

var _ = require('lodash');
var async = require('async');
var bedrock = require('bedrock');
var database = require('../lib/database');

describe('generator', function() {
  var generator;
  before(function(done) {
    database.getDistributedIdGenerator('testing', function(err, idGenerator) {
      if(err) {
        return done(err);
      }
      generator = idGenerator;
      done();
    });
  });

  it('should generate one id', function(done) {
    generator.generateId(function(err, id) {
      should.not.exist(err);
      should.exist(id);
      id.should.be.a('string');
      done();
    });
  });

  it('should generate 1000 uniq ids', function(done) {
    async.times(1000, function(n, callback) {
      generator.generateId(callback);
    }, function(err, results) {
      should.not.exist(err);
      should.exist(results);
      results.should.be.an('array');
      results.should.have.length(1000);
      _.uniq(results).should.have.length(1000);
      done();
    });
  });

  it('should allow creation of multiple generators', function(done) {
    async.times(100, function(n, callback) {
      database.getDistributedIdGenerator(n, callback);
    }, function(err, results) {
      should.not.exist(err);
      should.exist(results);
      results.should.be.an('array');
      results.should.have.length(100);
      done();
    });
  });

  it('work with new namespace per test session', function(done) {
    var NUMBER_OF_GENERATORS = 100;
    var now = Date.now();
    var NAMESPACE = 'ns_' + now;
    async.series([
      function(callback) {
        async.auto({
          createGenerators: function(callback) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              database.getDistributedIdGenerator(NAMESPACE, callback);
            }, callback);
          },
          generateIds: ['createGenerators', function(callback, results) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              results.createGenerators[n].generateId(callback);
            }, function(err, results) {
              should.not.exist(err);
              should.exist(results);
              results.should.be.an('array');
              results.should.have.length(NUMBER_OF_GENERATORS);
              _.uniq(results).should.have.length(NUMBER_OF_GENERATORS);
              callback();
            });
          }]
        }, callback);
      },
      function(callback) {
        async.auto({
          createGenerators: function(callback) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              database.getDistributedIdGenerator(NAMESPACE, callback);
            }, callback);
          },
          generateIds: ['createGenerators', function(callback, results) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              results.createGenerators[n].generateId(callback);
            }, function(err, results) {
              should.not.exist(err);
              should.exist(results);
              results.should.be.an('array');
              results.should.have.length(NUMBER_OF_GENERATORS);
              _.uniq(results).should.have.length(NUMBER_OF_GENERATORS);
              callback();
            });
          }]
        }, done);
      }
    ], done);
  });

  it('fails the second time you run the test', function(done) {
    var NUMBER_OF_GENERATORS = 500;
    var NAMESPACE = 'mynamespace';
    async.series([
      function(callback) {
        async.auto({
          createGenerators: function(callback) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              database.getDistributedIdGenerator(NAMESPACE, callback);
            }, callback);
          },
          generateIds: ['createGenerators', function(callback, results) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              results.createGenerators[n].generateId(callback);
            }, function(err, results) {
              should.not.exist(err);
              should.exist(results);
              results.should.be.an('array');
              results.should.have.length(NUMBER_OF_GENERATORS);
              _.uniq(results).should.have.length(NUMBER_OF_GENERATORS);
              callback();
            });
          }]
        }, callback);
      },
      function(callback) {
        async.auto({
          createGenerators: function(callback) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              database.getDistributedIdGenerator(NAMESPACE, callback);
            }, callback);
          },
          generateIds: ['createGenerators', function(callback, results) {
            async.times(NUMBER_OF_GENERATORS, function(n, callback) {
              results.createGenerators[n].generateId(callback);
            }, function(err, results) {
              should.not.exist(err);
              should.exist(results);
              results.should.be.an('array');
              results.should.have.length(NUMBER_OF_GENERATORS);
              _.uniq(results).should.have.length(NUMBER_OF_GENERATORS);
              callback();
            });
          }]
        }, done);
      }
    ], done);
  });

}); // end generator
