import { Schema } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default schema;
