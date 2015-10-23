var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CompetitionSchema = new Schema({
	_tournament: {
		type: Schema.Types.ObjectId,
		ref: 'Tournament',
		required: true	// dzieki required nie doda się konkurencja bez turnieju
	},
	name: { type: String, required: true },
	type: { type: String, required: true },
	teamSize:  { type: Number, min: 1 },
	start: { type: Boolean, default: 0 },
	finish: { type: Boolean, default: 0 },
	created: { type: Date, default: Date.now},
});

module.exports = mongoose.model('Competition', CompetitionSchema);