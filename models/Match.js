var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var MatchSchema = new Schema({
	_competition: {
		type: Schema.Types.ObjectId, 
		ref: 'Competition'
	},
	order: {type: Number, min: 1},
	round: {type: Number, default: 1},
	number: { type: Number },
	team1: { type: Schema.Types.ObjectId, ref: 'Team' },
	team2: { type: Schema.Types.ObjectId, ref: 'Team' },
	created: { type: Date, default: Date.now()},
	calls: [{
		date: { type: Date, default: Date.now()},
		table: Number
	}],
	start: { type: Boolean, default: false },
	winner: { type: Schema.Types.ObjectId, ref: 'Team' },
	losses: { type: Number, default: 0 },
	final: { type: Boolean, default: 0}
});

module.exports = mongoose.model('Match', MatchSchema);