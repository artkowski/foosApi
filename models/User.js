var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: { type: String, required: true, unique: true},
	password: String,
	admin: { type: Boolean, default: false },
	date: { type: Date, default: Date.now }
});

UserSchema.path('password').required(true);


module.exports = mongoose.model('User', UserSchema);