var User = require('./models/users');



module.exports = function(app, passport) {

app.get('/', function(req, res) {
  res.render('login');
});

//Google Authentication
app.get('/auth/google',
  passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']  }));

 //GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('Authentication successful');
    res.redirect('/success');
  });
app.get('/success', function(req, res){
  //req.session.passport.user;
  //data = JSON.stringify(req.session.passport.user);
  res.render('success', {profile:req.session.passport.user});
  //res.render('success')

  console.log('Authentication successful');
});


// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/fb/callback',
  passport.authenticate('facebook', { successRedirect: '/success',
                                      failureRedirect: '/login' }));

 /* app.get('/success', function(req, res){
  res.render('success');
});
*/

///Twitter Authentication
// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/tw/callback',
  passport.authenticate('twitter', { successRedirect: '/success',
                                     failureRedirect: '/login' }));


//Remote Login
app.get('/remotelogin', function(req, res){
  res.render('loginpage.ejs', { message: req.flash('loginMessage')}); 
});

app.post('/remotelogin', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/remotelogin',
		failureFlash: true
	}));

app.get('/signup', function(req, res){
  res.render('signup.ejs', { message: req.flash('signupMessage')}); 
});

app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/remotelogin',
		failureRedirect: '/signup',
		failureFlash: true
	}));


app.get('/profile', isLoggedIn, function(req, res){
  res.render('profile.ejs', { user: req.user }); 
}); 

app.get('/:username/:password', function(req, res){
		var newUser = new User();
		newUser.local.username = req.params.username;
		newUser.local.password = req.params.password;
		console.log(`${newUser.local.username}  ${newUser.local.password}`);
		newUser.save(function(err){
			if(err)
				throw err;
		});
		res.send("Success!");
	});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
}); 


function isLoggedIn(req, res, next) {
  if(req.isAuthenticated) {
    return next();
  }
  res.redirect('/login');
}
};