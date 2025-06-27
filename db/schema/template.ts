import { Schema } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default schema;
