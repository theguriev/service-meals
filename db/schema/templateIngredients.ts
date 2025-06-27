import { Schema } from "mongoose";

const schema = new Schema(
  {
    categoryId: {
      type: String,
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
  },
  { timestamps: true }
);

export default schema;
