import { ObjectId } from "mongodb";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export default defineEventHandler(async (event) => {
  const role = await getRole(event);
  if (role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the ingredient in the database
  const updated = await ModelTemplate.findOneAndUpdate(
    { _id: id },
    { $set: validatedBody },
    { new: true }
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }

  return {
    message: "Item updated successfully",
    data: updated,
  };
});
