import { ObjectId } from "mongodb";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  calories: z.number().min(0).optional(),
  proteins: z.number().min(0).optional(),
  grams: z.number().min(0).optional(),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const userId = await getUserId(event);
  const ingredientId = new ObjectId(getRouterParam(event, "id"));
  const categoryId = new ObjectId(getRouterParam(event, "categoryId"));

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

  // Find and update the ingredient
  // Ensure the ingredient belongs to the specified category and user
  const user = await getInitialUser(event, authorizationBase);
  if (can(user, "update-all-ingredients") || !can(user, "update-template-ingredients")) {
    const updatedIngredient = await ModelIngredients.findOneAndUpdate(
      can(user, "update-all-ingredients") ? {
        _id: ingredientId,
        userId,
      } : {
        _id: ingredientId,
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
  } else {
    const ingredients = await ModelIngredients.aggregate([
      {
        $match: {
          _id: ingredientId,
          categoryId,
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "meals",
                localField: "mealId",
                foreignField: "_id",
                as: "meals"
              }
            }
          ],
          as: "categories"
        }
      },
      {
        $match: {
          "categories.meals.templateId": { $exists: true, $ne: null }
        }
      }
    ]);

    if (ingredients.length === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }

    const updated = await ModelCategories.findOneAndUpdate(
      { _id: ingredientId },
      { $set: validatedBody },
      { new: true }
    );

    return updated;
  }
});
