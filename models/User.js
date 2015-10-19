var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: { type: String, required: true},
	password: String,
	admin: Boolean,
	date: { type: Date, default: Date.now }
}, { autoIndex: false });

UserSchema.path('password').required(true);


UserSchema.methods.myName = function() {
	var greeting = this.name
		? "Mam na imię " + this.name
		:	"Nie mam imienia";
	return greeting;
}

module.exports = mongoose.model('User', UserSchema);