global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';
// var Db = require('mongodb').Db,
//     MongoClient = require('mongodb').MongoClient,
//     Server = require('mongodb').Server,
//     ReplSetServers = require('mongodb').ReplSetServers,
//     ObjectID = require('mongodb').ObjectID,
//     Binary = require('mongodb').Binary,
//     GridStore = require('mongodb').GridStore,
//     Grid = require('mongodb').Grid,
//     Code = require('mongodb').Code,
//     BSON = require('mongodb').pure().BSON,
//     assert = require('assert');

// var db = new Db('test', new Server('localhost', 27017));

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;
var storage = server.storage;
var id = '';

chai.use(chaiHttp);

describe('Shopping List', function() {
    before(function(done) {
        server.runServer(function() {
            Item.create({name: 'Broad beans'},
                        {name: 'Tomatoes'},
                        {name: 'Peppers'}, function() {
                done();
            });
        });
    });

    after(function(done) {
        Item.remove(function() {
            done();
        });
    });
    
    it('should list items on GET', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0]._id.should.be.a('string');
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                id = res.body[1]._id;
                res.body[2].name.should.equal('Peppers');
                done();
            });
    });
    it('should add an item on POST', function(done) {
        chai.request(app)
            .post('/items')
            .send({'name': 'Kale'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body.name.should.be.a('string');
                res.body._id.should.be.a('string');
                res.body.name.should.equal('Kale');
                // console.log(db.collection.count())
                // storage.items.should.be.a('array');
                // storage.items.should.have.length(4);
                // storage.items[3].should.be.a('object');
                // storage.items[3].should.have.property('id');
                // storage.items[3].should.have.property('name');
                // storage.items[3].id.should.be.a('number');
                // storage.items[3].name.should.be.a('string');
                // storage.items[3].name.should.equal('Kale');
                done();
            });
    });
    it('should remove and return item on delete', function(done){
        chai.request(app)
            .delete('/items/'+id)
            .end(function(err, res){
               should.equal(err, null); 
               res.should.have.status(201);
               res.should.be.json;
               res.body.should.be.a('object');
               done();
            });
    });
    it("should return item not found for non-existent id", function(done){
        chai.request(app)
            .delete('/items/5')
            .end(function(err, res){
                res.should.have.status(500);
                done();
            });
    })
    it('should change the name of the object on update', function(done){
        chai.request(app)
            .put('/items/'+id)
            .send({'name': 'Kale', '_id': id})
            .end(function(err, res){
              should.equal(err, null);
              res.should.have.status(201);
              res.body.should.be.a('object');
              console.log(res.body)
            //   res.body.name.should.equal('Kale');
            //   res.body._id.should.equal(id);
              done(); 
        });
    })
    it('should add an object when the id is non-existent on update', function(done){
        chai.request(app)
            .put('/items/578c52c9ad6be295ba99a5d9')
            .send({'name': 'blueberries', '_id': '578c52c9ad6be295ba99a5d9'})
            .end(function(err, res){
               should.equal(err, null);
               res.should.have.status(201);
               res.body.should.be.a('object');
            //   res.body.name.should.equal('blueberries');
            //   res.body.id.should.equal(5);
               done();
            });
    })
});