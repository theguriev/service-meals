import { ObjectId } from "mongodb";

const updateSchema = z.object({
  ids: z.string().min(1, "IDs are required").optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid set ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the set in the database
  const updated = await ModelSets.findOneAndUpdate(
    { _id: id, userId },
    { $set: validatedBody },
    { new: true }
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "Set not found" });
  }

  return {
    message: "Set updated successfully",
    data: updated,
  };
});
