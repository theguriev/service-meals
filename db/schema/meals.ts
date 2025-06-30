import { Schema } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    templateId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Template",
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default schema;
