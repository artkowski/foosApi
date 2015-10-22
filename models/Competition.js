var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CompetitionSchema = new Schema({
	_tournament: {
		type: Schema.Types.ObjectId,
		ref: 'Tournament',
		required: true	// dzieki required nie doda się konkurencja bez turnieju
	},
	name: {type: String, required: true},
	teamSize: Number,
	start: Boolean,
	finish: Boolean,
	// competitions: [{ type: Schema.Types.ObjectId, ref: 'Competition'}]
});

module.exports = mongoose.model('Competition', CompetitionSchema);