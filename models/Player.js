var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PlayerSchema = new Schema({
	_league: { type: Number, ref: 'League'},
	name: {
		first: {type: String, required: true},
		last: String
	},
	syg: String,
	points: { type: Number, index: -1, default: 0},
	city: String,
	className: String,
	created: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Player', PlayerSchema);