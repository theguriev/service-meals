import { ObjectId } from "mongodb";
import { RootFilterQuery } from "mongoose";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  templateId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the ingredient in the database
  const user = await getInitialUser(event, authorizationBase);
  const updateMatch: RootFilterQuery<InferSchemaType<typeof schemaMeals>> = {
    _id: new ObjectId(id),
  };

  if (!can(user, "update-all-meals") && can(user, "update-template-meals")) {
    updateMatch.templateId = { $exists: true };
  } else if (!can(user, "update-all-meals")) {
    updateMatch.userId = userId;
  }

  const updated = await ModelMeals.findOneAndUpdate(
    updateMatch,
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
