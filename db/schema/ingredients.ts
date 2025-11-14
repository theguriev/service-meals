import { Schema } from "mongoose";

const schema = new Schema(
	{
		userId: {
			type: String,
			required: true,
			ref: "User",
		},
		categoryId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Category",
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		calories: {
			type: Number,
			required: true,
			min: 0,
		},
		proteins: {
			type: Number,
			required: true,
			min: 0,
		},
		grams: {
			type: Number,
			required: true,
			min: 0,
		},
		unit: {
			type: String,
			enum: ["grams", "pieces"],
			default: "grams",
		},
		isAlcohol: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

export default schema;
