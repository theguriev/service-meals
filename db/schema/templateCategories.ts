import { Schema } from "mongoose";

const schema = new Schema(
  {
    mealId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default schema;
