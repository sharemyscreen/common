import mongoose from 'mongoose';
import {uidGen} from '../utils';

const Schema = mongoose.Schema;

const clientSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	key: {
		type: String,
		unique: true
	},
	secret: {
		type: String,
		unique: true
	},
	trusted: {
		type: Boolean,
		default: false
	}
}, {timestamps: true});

clientSchema.statics.createNew = function (name, cb) {
	clientModel.create({
		name: name,
		key: uidGen(16),
		secret: uidGen(32)
	}, cb);
};

const clientModel = mongoose.model('Client', clientSchema);

export default clientModel;
