var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TournamentSchema = new Schema({
	_league: {
		type: Schema.Types.ObjectId,
		ref: 'League',
		required: true	// na razie required ale będzie można zrobić turniej poza ligą
	},
	name: {type: String, required: true},
	desc: String,
	startDate: {type: Date, required: true},
	endDate: Date,
	city: String,
	created: { type: Date, default: Date.now},
	competitions: [{ type: Schema.Types.ObjectId, ref: 'Competition'}],
	owners: [ {type: Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Tournament', TournamentSchema);