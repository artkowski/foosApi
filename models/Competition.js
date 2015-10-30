var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	deepPopulate = require('mongoose-deep-populate')(mongoose);

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
	teams: [{ type: Schema.Types.ObjectId, ref: 'Team'}],
	matches: [{ type: Schema.Types.ObjectId, ref: 'Match'}],
	startSize: Number	// ilość meczy w pierwszej rundzie
});

CompetitionSchema.plugin(deepPopulate, {
	populate: {
		'teams': {
			options: {
				sort: {totalPoints: -1}
			}
		}
	}
});

module.exports = mongoose.model('Competition', CompetitionSchema);