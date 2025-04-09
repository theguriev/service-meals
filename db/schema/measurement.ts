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
    type: {
      type: String,
      required: true,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default schema;
