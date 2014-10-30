var express = require('express');
var expressHbs = require('express-handlebars');
var bodyParser = require('body-parser');

var app = express();

app.engine('hbs', expressHbs({
  extname: 'hbs',
  defaultLayout: 'main.hbs'
}));

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
  extended: false
}));

var mongoose = require("mongoose");

mongoose.connect(process.env.COMPOSE_URL);

var Schema = mongoose.Schema;

var bookSchema = new Schema({
  title: String,
  author: String,
  description: String
});

var Book = mongoose.model("Book", bookSchema);


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/all', function(req, res) {
  Book.find(function(err, allbooks, count) {
    res.render('all', {
      books: allbooks
    });
  });
});


app.get("/new", function(req, res) {
  res.render('book', {
    id: 0,
    title: "",
    author: "",
    description: "",
    action: "Add"
  });
});

app.get("/edit/:id", function(req, res) {
  Book.findById(req.params.id, function(err, book) {
    res.render('book', {
      id: book._id,
      title: book.title,
      author: book.author,
      description: book.description,
      action: "Update"
    });
  });
});

app.post('/update/:id', function(req, res) {
  if (req.params.id == 0) {
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description
    });
    book.save(function(err) {
      res.redirect("/");
    });
  } else {
    Book.findById(req.params.id, function(err, book) {
      book.title = req.body.title;
      book.author = req.body.author;
      book.description = req.body.description;
      book.save(function(err, book, count) {
        res.redirect('/');
      });
    });
  }
});

app.get("/delete/:id", function(req, res) {
  Book.findById(req.params.id, function(err, book) {
    book.remove(function(err, book) {
      res.redirect('/');
    });
  });
});

app.get("/search/", function(req,res) {
  res.render("search");
});

app.post("/search/", function(req,res) {
  var terms=req.body.terms;
  Book.find({ 'title': new RegExp(terms, 'i') } , function(err,books,count) {
    res.render("search", { terms:terms, books:books })
  });
});

app.listen(3000);
