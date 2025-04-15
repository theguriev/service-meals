import { ObjectId } from "mongodb";

const ingredientUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  calories: z.number().min(0, "Calories must be a positive number").optional(),
  meta: z.record(z.any()).optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const ingredientId = getRouterParam(event, "id");

  if (!ObjectId.isValid(ingredientId)) {
    throw createError({ statusCode: 400, message: "Invalid ingredient ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(
    event,
    ingredientUpdateSchema.parse
  );

  // Update the ingredient in the database
  const updatedIngredient = await ModelIngredients.findOneAndUpdate(
    { _id: ingredientId, userId },
    { $set: validatedBody },
    { new: true }
  );

  if (!updatedIngredient) {
    throw createError({ statusCode: 404, message: "Ingredient not found" });
  }

  return {
    message: "Ingredient updated successfully",
    ingredient: updatedIngredient,
  };
});
