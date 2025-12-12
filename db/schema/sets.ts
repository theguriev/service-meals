import { Schema } from "mongoose";

const schema = new Schema(
	{
		userId: {
			type: String,
			required: true,
			ref: "User",
		},
		ingredients: [
			{
				id: { type: String, required: true },
				value: { type: Number, required: true },
				additionalInfo: { type: String, required: false },
			},
		],
		recipeId: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: "recipes-v2",
		},
		source: {
			type: String,
			enum: ["manual", "recipe"],
			default: "manual",
		},
		recipePortions: {
			type: Number,
			required: false,
			min: 0,
		},
	},
	{ timestamps: true },
);

export default schema;
