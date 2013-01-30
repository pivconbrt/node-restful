var users = require('./users'),
    restful = require('../../'),
    mongoose = require('mongoose'),
    sinon = require('sinon'),
    movie,
    movieobjs = [],
    before = function(req, res, next) { next(); },
    after = function(req, res, next, err, model) { next(); },
    spies = {
      get: {
        before: sinon.spy(before),
        after: sinon.spy(after),
      },
      put: {
        before: sinon.spy(before),
        after: sinon.spy(after),
      },
      post: {
        before: sinon.spy(before),
        after: sinon.spy(after),
      },
    }

var moviemodel = {
  title: "movies",
  methods: [
    {
      type: 'get',
      before: spies.get.before,
      after: spies.get.after,
    },
    {
      type: 'post',
      before: spies.post.before,
      after: spies.post.after,
    },
    {
      type: 'put',
      before: spies.put.before,
      after: spies.put.after,
    },
  ],
  excludes: ['secret'],
  schema: mongoose.Schema({
    title: { type: 'string', required: true },
    year: { type: 'number' },
    creator: { type: 'ObjectId', ref: "users" },
    comments: [{ body: String, date: Date, author: { type: 'ObjectId', ref: 'users' }}],
    meta: {
      productionco: "string",
      director: { type: 'ObjectId', ref: 'users' },
    },
    secret: { type: 'string', select: false }
  }),
  update: {
    sort: false
  },
  delete: {
    sort: false
  },
  routes: {
    recommend: function(req, res, next) {
      res.writeHead(200, {'Content-Type': 'application/json' });
      res.bundle = JSON.stringify({
        recommend: "called",
      });
      next();
    },
    anotherroute: {
      handler: function(req, res, next) {
        res.writeHead(200, {'Content-Type': 'application/json' });
        res.bundle = JSON.stringify({
          anotherroute: "called",
        });
        next();
      },
    },
    athirdroute: {
      handler: function(req, res, next, err, obj) {
        if (err) {
          res.writeHead(err.status, {'Content-Type': 'application/json' });
          return next();
        }
        res.writeHead(200, {'Content-Type': 'application/json' });
        res.bundle = JSON.stringify({
          athirdroute: "called",
          object: obj
        });
        next();
      },
      methods: ['get', 'post'],
      detail: true,
    }
  },
  version: "api",
}

exports.register = function(app) {
  if (users.users.length < 1 || !users.users[0]._id) {
    throw new Error("Movies must be registered after users");
  }
  var movies = [{
    title: "Title1",
    year: 2012,
    meta: {
      productionco: "idk",
      director: users.users[1]._id,
    },
    creator: users.users[0]._id,
    secret: "A SECRET STRING",
  }, { 
    title: "Title2", 
      year: 2011 
  }, { 
    title: "Title3",
      year: 2013
  }];
  movie = new restful.Model(moviemodel);
  movie.register(app);
  movie.spies = spies;
  movies.forEach(function(movieopts) {
    var obj = new movie.Obj(movieopts);
    obj.save();
    movieobjs.push(obj);
  });
  exports.movie = movie;
  exports.movies = movieobjs;
  return exports
}

exports.movie = movie;
exports.movies = movieobjs;