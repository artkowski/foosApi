var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	deepPopulate = require('mongoose-deep-populate')(mongoose),
	_ = require('lodash')

// var schemaOptions = {
// 	toJSON: {
// 		virtuals: true
// 	}
// }

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
	results: [{
		place: Number,
		date: {type: Date, default: Date.now},
		team: { type: Schema.Types.ObjectId, ref: 'Team' }
	}],
	startSize: Number	// ilość meczy w pierwszej rundzie
});

// CompetitionSchema.virtual('results').get(function() {
// 	// if(!this.start) return [];
// 	// get matches
// 	var matches = _.map(this.matches, function(item) {
// 		return item.losses > 0 ? item : false;
// 	})
// 	matches = _.sortByOrder(this.matches, ['round', 'order'], ['asc', 'asc']);
// 	var place = this.startSize*2 - matches.length;
// 	// matches = _.map()
// 	console.log(matches);
// 	return matches;
// })

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