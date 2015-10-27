var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var MatchSchema = new Schema({
	_competition: {
		type: Schema.Types.ObjectId, 
		ref: 'Competition'
	},
	order: {type: Number, min: 1},
	team1: { type: Schema.Types.ObjectId, ref: 'Team' },
	team2: { type: Schema.Types.ObjectId, ref: 'Team' },
	created: { type: Date, default: Date.now()},
	call: { type: Number, default: 0 },
	start: { type: Boolean, default: false },
	winner: { type: Schema.Types.ObjectId, ref: 'Team' }
});

module.exports = mongoose.model('Match', MatchSchema);