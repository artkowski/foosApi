var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var LeagueSchema = new Schema({
	name: { type: String, required: true, index: 1},
	created: {type: Date, default: Date.now},
	owners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
	tournaments: [{ type: Schema.Types.ObjectId, ref: 'Tournament'}]
});


module.exports = mongoose.model('League', LeagueSchema);