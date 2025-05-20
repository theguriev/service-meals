import { ObjectId } from "mongodb";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  calories: z.number().min(0).optional(),
  proteins: z.number().min(0).optional(),
  grams: z.number().min(0).optional(),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const ingredientId = getRouterParam(event, "id");
  const categoryId = getRouterParam(event, "categoryId");

  if (!userId) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  if (!ObjectId.isValid(ingredientId) || !ObjectId.isValid(categoryId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid ingredient or category ID",
    });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);
  const category = await ModelCategories.findOne({
    _id: new ObjectId(categoryId),
    userId,
  });

  if (!category) {
    throw createError({
      statusCode: 404,
      message: "Category not found or access denied",
    });
  }

  // Find and update the ingredient
  // Ensure the ingredient belongs to the specified category and user
  const updatedIngredient = await ModelIngredients.findOneAndUpdate(
    {
      _id: new ObjectId(ingredientId),
      categoryId: categoryId,
      userId,
    },
    { $set: validatedBody },
    { new: true } // Return the updated document
  );

  if (!updatedIngredient) {
    throw createError({
      statusCode: 404,
      message:
        "Ingredient not found, or it does not belong to the specified category/user",
    });
  }

  return updatedIngredient;
});
