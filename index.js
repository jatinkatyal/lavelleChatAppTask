//***********************************************
//				Imports
//***********************************************
var express = require( "express");
var ejs = require("ejs");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var multer = require('multer');
var sha256 = require('sha256');

var app = express();
var upload = multer(); 
var server_port = process.env.PORT || 8080
var server_ip_address = process.env.IP || '127.0.0.1'
var mongo_uri = process.env.MONGODB_URI || 'mongodb://localhost/chat'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret:"jatin"}));
mongoose.connect(mongo_uri);
console.log(mongo_uri)

const urlencodedParser = bodyParser.urlencoded({extended:false});
app.engine('html',ejs.renderFile);


//***********************************************
//					Models
//***********************************************
var Users = mongoose.model("user",{
	username: {
		type:String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required:  true
	},
	name: {
		type:String,
		required:true
	}
});

var Msgs = mongoose.model("messages",{
	to: {
		type:String,
		required:true,
	},
	from:{
		type:String,
		required:true,
	},
	msg:{
		type:String,
		required:true,
	},
});


//***********************************************
//				Routes & Ops
//***********************************************
app.get(['/','/login'],(req,res)=>{
	res.render("./login.html");
});
app.post('/login',urlencodedParser,(req,res)=>{
	username = req.body.username;
	password = sha256(req.body.password);
	if(!username||!password){
		res.send("Incomplete Input")
	}else{
		Users.findOne({username},(err,user)=>{
			if(err){
				res.send(err.errmsg);
			}else{
				if(user){
					if(password==user.password){
						console.log(user.name+" logged in");
						req.session.user = user;
						res.redirect('/dashboard');
					}else{
						res.send("invalid pswd")
					}
				}else{
					res.send("Unregistered");
				}
			}
		});
	}
});
app.get('/signup',(req,res)=>{
	res.render("./signup.html");
});
app.post('/signup',urlencodedParser,(req,res)=>{
	var newUsers = new Users();
	newUsers.username = req.body.username;
	newUsers.name = req.body.name;
	newUsers.password = sha256(req.body.password);
	if(!newUsers.username || !newUsers.name || !newUsers.password){
		res.send("Incomplete data");
	}else{
		newUsers.save((err)=>{
			if(err){
				res.send(err.errmsg);
			}
		res.redirect('/login')
		});
	}
});

app.get('/test',(req,res)=>{
	res.send(Msgs.find())
})

app.get('/dashboard',checkSignIn,(req,res)=>{
	messages = Msgs.find({$or:[{from:req.session.user.username},{to:req.session.user.username}]},(err,data)=>{
		if(err){
			res.send(err.errmsg);
		}else{
			res.render("./dashboard.ejs",{
				user:req.session.user.name,
				messages:data
	})}});
	//res.send(req.session.user);
})	
app.get('/logout',(req,res)=>{
	req.session.destroy();
	res.redirect('/login');
})
app.post('/send',(req,res)=>{
	message = new Msgs()
	message.from = req.session.user.username;
	message.to = req.body.to;
	message.msg = req.body.msg;
	if(!message.to || !message.msg){
		res.send("Enter data");
	}else{
		Users.findOne({username:message.to},(err,user)=>{
			if(err){
				res.send(err.errmsg);
			}
			else if(!user){
				res.send("no user found.")
			}else{
				message.save((err,message)=>{
					if(err){
						res.send(err.errmsg);
					}else{
						res.redirect('/dashboard');
					}
				});
			}
		});
	}
})


//***********************************************
//				Custom functions
//***********************************************
function checkSignIn(req,res,next){
	if(req.session.user){
		next();
	}
	else{
		res.redirect("/login");
	}
}


app.listen(server_port, server_ip_address,()=>{
	console.log("server started");
});