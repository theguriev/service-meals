import { Schema } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default schema;
