var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var habitat = require('habitat');

var User = require('../app/models/users');

habitat.load('.env.dev');

module.exports = function(passport) {

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
var user = function (profile, done) {
 User.findOne({ 'social.displayName' : profile.displayName } , function(err, user){
	if(err)
		done(err);
	if(user){
		if( profile.provider === 'google' && user.social.provider.google !== profile.provider) {
			User.insert(
				{
					social : {
				        displayName : profile.displayName,
					    provider : {
							     google : profile.provider,
				     		  }
					}
                    
			}, function (err, raw) {
				if (err) return handleError(err);
				console.log('The raw response from Mongo was ', raw);
			});
            
			return done(null, profile);
		}else if( profile.provider === 'facebook' && user.social.provider.facebook !== profile.provider) {
			User.insert(
				{                    
					social : {
				      facebookId : profile.id,
				      displayName : profile.displayName,
					  provider : {
                         facebook : profile.provider
						}
					}
                    
			}, function (err, raw) {
				if (err) return handleError(err);
				console.log('The raw response from Mongo was ', raw);
			});
			return done(null, profile);
		} else if( profile.provider === 'twitter' && user.social.provider.twitter !== profile.provider) {
			db.updateUser(
				"user",
				{
					social : [
						twitterId = profile.id,
				    displayName = profile.displayName,
					  provider = [
						  twitter = profile.provider
					]
				]	
			});
		} 

		console.log("user exists");
		done(null, profile);
	} else {
		var newUser = new User();
	if( profile.provider === 'google' ) {
        newUser.social.googleid = profile.id;
		newUser.social.displayName = profile.displayName;
        newUser.social.provider.google = profile.provider;

		newUser.save(function(err){
			if(err)
				throw err;
			return done(null, newUser);
		})
	}else if(profile.provider === 'facebook') {
        newUser.social.facebookid = profile.id;
		newUser.social.displayName = profile.displayName;
		newUser.social.provider.facebook = profile.provider;
		
		newUser.save(function(err){
			if(err)
				throw err;
			return done(null, newUser);
		})
	}else if(profile.provider === 'twitter') {
        newUser.social.twitterid = profile.id;
		newUser.social.displayName = profile.name;	
		newUser.social.provider.twitter = profile.provider;

		newUser.save(function(err){
			if(err)
				throw err;
			return done(null, newUser);
		})
	}					
	}
});
}
/*User.findOne({  }, function(err, user) {
			 if(user) {
				 console.log('User already exists!');
				 }
				else {
				var newUser = new User();
				newUser.social.googleId = profile.id;
				newUser.social.displayName = profile.displayName;
				newUser.social.facebookId = profile.id;
				newUser.social.twitterId = profile.id;
                newUser.social.provider.google = profile.provider;
                newUser.social.provider.facebook = profile.provider;
                newUser.social.provider.twitter = profile.provider;
				newUser.save(newUser);
				console.log('User created in database!');
			}
    
		});
		*/
//var google = social.provider.google;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK || process.env.HEROKU_GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, done) {
  	user(profile,done);
    //User.find({ 'social.provider.google' : profile.provider});
   
    return done(null, profile);
	}
));


//Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK || process.env.HEROKU_FACEBOOK_CALLBACK
  },
	function(accessToken, refreshToken, profile, done) {
		user(profile,done);
   /* User.findOne({ 'social.displayName': profile.displayName}, function (err, user) {
			if(user) {
			console.log("User exists!");
			}
			else {
				var newUser = new User();
				newUser.social.id = profile.id;
				newUser.social.displayName = profile.displayName;
				newUser.save(newUser);
				console.log('User created in database!');
			}
		});
		*/
    //return done(null, profile);
  }
));


//Twitter Strategy
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK
  },
  function(token, tokenSecret, profile, done) {
		user(profile,done);
    //User.findOrCreate(..., function(err, user) {
      //if (err) { return done(err); }
      //done(null, user);
    //});
   return done(null, profile);
  }
));


///Local Strategy
passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		process.nextTick(function(){
			User.findOne({'local.username': email}, function(err, user){
				if(err)
					return done(err);
				if(user){
					return done(null, false, req.flash('signupMessage', 'That email already taken'));
				} else {
					var newUser = new User();
					newUser.local.username = email;
					newUser.local.password = password;

					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					})
				}
			})

		});
	}));

	passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, email, password, done){
			process.nextTick(function(){
				User.findOne({ 'local.username': email}, function(err, user){
					if(err)
						return done(err);
					if(!user)
						return done(null, false, req.flash('loginMessage', 'No User found'));
					if(user.local.password != password){
						return done(null, false, req.flash('loginMessage', 'invalid password'));
					}
					return done(null, user);

				});
			});
		}
	));
};

