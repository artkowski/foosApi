var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TeamSchema = new Schema({
	_competition: {
		type: Schema.Types.ObjectId, 
		ref: 'Competition'
	},
	players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
	totalPoints: Number,
	created: { type: Date, default: Date.now()},
	name: { type: String }
});

module.exports = mongoose.model('Team', TeamSchema);