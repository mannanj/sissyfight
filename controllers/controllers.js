/*
	controllers
	
	For now, controllers are simple, so they can all sit in one file
	Split 'em out if they get too big
*/
var User = require('../models/user');
var qs = require('querystring');

module.exports = function(app) {
	
	
	app.get('/user/start', function(req, res) {
		var flash = req.session.flash;
		delete req.session['flash'];
		if (req.session.user) {
			res.redirect('/game?' + qs.stringify(req.query));
		}
		else {
			var query = qs.stringify(req.query);
			res.render('login', {user: req.session.user, loginAttempt:req.session.loginAttempt, flash:flash, query:query});
		}
	});
	
	// user -----------
	
	app.post('/user/login', function(req, res) {
		User.checkLogin(req.body.nickname, req.body.password, function(err, user) {
			if (err) {
				console.log("/user/login checklogin trouble: " + err);
				req.session.flash = {login: "Database trouble!"};
				res.redirect('/user/start?' + qs.stringify(req.query));
			}
			else {
				if (user) {
					req.session.user = {nickname:user.nickname, id:user.id};
					delete req.session['loginAttempt'];
					res.redirect('/game?' + qs.stringify(req.query));
				}
				else {
					delete req.session['user'];
					req.session.flash = {login: "Wrong username or password"};
					req.session.loginAttempt = {nickname:req.body.nickname};
					res.redirect('/user/start?' + qs.stringify(req.query));
				}
			}
		});
	});
	
	app.get('/user/logout', function(req, res) {
		req.session.destroy();
		res.redirect('/user/start?' + qs.stringify(req.query));
	});
	app.post('/user/logout', function(req, res) {
		req.session.destroy();
		res.redirect('/user/start?' + qs.stringify(req.query));
	});
	
	app.post('/user/new', function(req, res) {
		console.log("/user/new", req.body.nickname, req.body.password);
		User.find({where:{nickname:req.body.nickname}})
		.success(function(user){
			if (user) {
				delete req.session['user'];
				req.session.flash = {'newUser': 'Sorry, the name '+req.body.nickname+' is already taken.'};
				res.redirect('/user/start?' + qs.stringify(req.query));
			}
			else {
				User.createUser({nickname:req.body.nickname, password:req.body.password}, function(err, user) {
					if (err) {
						delete req.session['user'];
						console.log('/user/new: createUser error: ' + err);
						req.session.flash = {'newUser':'Database trouble!'};
						res.redirect('/user/start?' + qs.stringify(req.query));						
					}
					else {
						req.session.user = user; //{nickname:user.nickname, id:user.id};
						res.redirect('/user/start?' + qs.stringify(req.query));
					}
				})
			}
		});

	});
	
	app.get('/user', function(req, res) {
		res.redirect('/user/start?' + qs.stringify(req.query));
	});
	
	
	
	// game ------------------
	
	app.get('/game', function(req, res) {
		if (req.session.user) {
			// send a token to the page that can be used to associate the socket with the user session
			var token = req.session.user.nickname + Math.random();
			req.session.token = token;
			// get school id or default
			if (req.query.school && app.get('getSchoolInfo')(req.query.school)) {
				req.session.school = req.query.school;
			}
			else {
				req.session.school = app.get('schoolDefault'); // TODO: school will be set by URL path or something...
			}
			var gameScale = 1, gameWidth=528, gameHeight=276;
			if (req.param('double')) {
				gameScale *= 2;
				gameWidth *= 2;
				gameHeight *= 2;
			}
			res.render('game', {user:req.session.user, token:req.session.token, session:req.session.id,
									school:req.session.school, 
									gameScale:gameScale, gameWidth:gameWidth, gameHeight:gameHeight});
		}
		else {
			req.session.flash = {login: "Please log in"};
			res.redirect('/user/start?' + qs.stringify(req.query));
		}
		
	});
	
	
	// site -------------
	
	// homepage
	app.get('/', function(req, res) {
		res.redirect('/site/'); // temporary: redirect to static site
	});

}