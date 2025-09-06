import { ObjectId } from "mongodb";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, ["update-own-templates", "update-all-templates"])) {
    throw createError({ statusCode: 403, message: "Forbidden: User does not have permission to update templates" });
  }
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the ingredient in the database
  const updated = await ModelTemplate.findOneAndUpdate(
    can(user, "update-all-templates") ? { _id: id } : { _id: id, userId: user._id.toString() },
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
