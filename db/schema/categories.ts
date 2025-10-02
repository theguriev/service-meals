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
    templateId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Template",
    },
  },
  { timestamps: true }
);

export default schema;
