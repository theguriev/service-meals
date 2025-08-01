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
      },
    ],
  },
  { timestamps: true }
);

export default schema;
