import { Schema } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    timestamp: {
      type: Number,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Number,
          default: Date.now,
        },
        id: {
          type: String,
          required: true,
        },
        ingredients: [String],
      },
    ],
  },
  { timestamps: true }
);

export default schema;
