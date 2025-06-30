import { Schema } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    mealId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Meal",
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default schema;
