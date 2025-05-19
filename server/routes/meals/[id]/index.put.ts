import { ObjectId } from "mongodb";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the ingredient in the database
  const updated = await ModelMeals.findOneAndUpdate(
    { _id: id, userId },
    { $set: validatedBody },
    { new: true }
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }

  return {
    message: "Item updated successfully",
    ingredient: updated,
  };
});
