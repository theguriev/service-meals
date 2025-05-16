import { Schema } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default schema;
