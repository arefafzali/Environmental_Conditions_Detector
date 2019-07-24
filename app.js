var bcrypt = require('bcryptjs');
var nJwt = require('njwt');
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const PORT = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', jsonParser, function(req, res){
  var token = req.headers.cookie;
  if (token)
  {
    token = token.substring(4);
    nJwt.verify(token,'secret',function(err,verifiedJwt){
      if (err) {
        res.sendFile(path.join(__dirname+'/public/htmlfiles/Login.html'));
      }
      else{
        res.sendFile(path.join(__dirname+'/public/htmlfiles/dashboard.html'));
      }
    });
  } 
  else
  res.sendFile(path.join(__dirname+'/public/htmlfiles/Login.html'));
});


app.get('/logout', jsonParser, function(req, res){
  var token = req.headers.cookie;
  if (token)
  {
    res.clearCookie('jwt');
  } 
  res.send();
});



app.get('/login_page', jsonParser, function(req, res){
  var token = req.headers.cookie;
  if (token)
  {
    token = token.substring(4);
    nJwt.verify(token,'secret',function(err,verifiedJwt){
      if (err) {
        res.sendFile(path.join(__dirname+'/public/htmlfiles/Login.html'));
      }
      else{
        res.sendFile(path.join(__dirname+'/public/htmlfiles/dashboard.html'));
      }
    });
  } 
  else
  res.sendFile(path.join(__dirname+'/public/htmlfiles/Login.html'));
});

app.get('/signup_page', jsonParser, function(req, res){
  var token = req.headers.cookie;
  if (token)
  {
    token = token.substring(4);
    nJwt.verify(token,'secret',function(err,verifiedJwt){
      if (err) {
        res.sendFile(path.join(__dirname+'/public/htmlfiles/Signup.html'));
      }
      else{
        res.sendFile(path.join(__dirname+'/public/htmlfiles/dashboard.html'));
      }
    });
  } 
  else
  res.sendFile(path.join(__dirname+'/public/htmlfiles/Signup.html'));
});

app.get('/dashboard', jsonParser, function(req, res){
    var token = req.headers.cookie;
  if (token)
  {
    token = token.substring(4);
    nJwt.verify(token,'secret',function(err,verifiedJwt){
      if (err) {
        res.sendFile(path.join(__dirname+'/public/htmlfiles/dashboard.html'));
      }
      else{
        res.sendFile(path.join(__dirname+'/dashboard.html'));
      }
    });
  } 
  else
  res.sendFile(path.join(__dirname+'/public/htmlfiles/Login.html'));
});


var mongoose = require('mongoose');
mongoose.connect('mongodb://diyar:12345678diyar@ds035747.mlab.com:35747/iot_fall97_dm_fsh', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
});

var GroupSchema = new mongoose.Schema({
    groupname: String,
    password: String,
    channelID: String
  });

var Groups = mongoose.model('Groups', GroupSchema);

var UsersSchema = new mongoose.Schema({
  groupname: String,
  username: String
});

var Users = mongoose.model('Users', UsersSchema);


app.get('/groupinfo', async function(req, res){
  var token = req.headers.cookie;
  var chID;
  if (token)
  {
    token = token.substring(4);
    nJwt.verify(token,'secret',async function(err,verifiedJwt){
      if (err) {
        res.send();
      }
      else{
        var gname = verifiedJwt.body['groupname'];
        var query = await Groups.findOne({ groupname: gname},  function (err, group) {});
        if (query)
        {
          chID = query.channelID;
        }
        var mmbrsquery = await Users.find({ groupname: gname},  function (err, group) {});
        var mmbrs = []
        for (mq in mmbrsquery)
        {
          mmbrs.push(mmbrsquery[mq].username);
        }
        res.send({
          groupname: gname,
          channelID: chID,
          members: mmbrs
        });
      }
    });
  } 
  else
  res.sendFile(path.join(__dirname+'/public/htmlfiles/Login.html'));

})



app.post('/signup', jsonParser, async function(req, res){
  var gname = req.body['groupname'];
  var query = await Groups.findOne({ groupname: gname},  function (err, group) {});
  if (query)
  {
    return res.status(400).send({
      message: "Group name is used."
    });
  }
  var new_Group = new Groups({ groupname: gname, password:bcrypt.hashSync(req.body.password, 13), channelID:req.body['channelID'] });
  new_Group.save(function (err, group) { 
    if (err) {
      return res.status(400).send({
        message: err
      });
    }
  });
  
  for (p in req.body)
  {
    if (p == 'groupname' | p == 'password' | p=='channelID')
      continue;
    var new_user = new Users({ groupname: gname, username: req.body[p]});
    
    new_user.save(function (err, new_user) {
      if (err) {
        return res.status(400).send({
          message: err
        });
      }
    })

  };

  return res.status(200).send({
    message: "Signed up successfully",
    go: true
  });
});

app.post('/login', jsonParser, async function(req, res){
  var gname = req.body['groupname'];
  var query = await Groups.findOne({ groupname: gname},  function (err, group) {});
  if (!query)
  {
    return res.status(400).send({
      message: "Group name is not found."
    });
  }
  if (bcrypt.compareSync(req.body.password, query.password)){
    var claims = {
      groupname: gname,  // The URL of your service
    };

  var jwt = nJwt.create(claims,'secret');
  var t = await jwt.compact();
  res.cookie('jwt', t);
    return res.status(200).send({
      message: "Signed in successfuls",
      go: true
    });
  }
  else{
    return res.status(400).send({
      message: "Password is not correct "
    });
  }
});

app.listen(PORT);