var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var LeagueSchema = new Schema({
	name: { type: String, required: true, index: 1},
	created: {type: Date, default: Date.now},
	players: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
});

module.exports = mongoose.model('League', LeagueSchema);