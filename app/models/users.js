var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	local: {
		username: String,
		password: String,
	},
	social: {
		displayName: String,
		provider: {
            google: String,
            faceook: String,
            twitter: String,
        },
	}
});

module.exports = mongoose.model('User', userSchema);