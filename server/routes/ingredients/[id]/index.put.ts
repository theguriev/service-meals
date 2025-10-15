import { ObjectId } from "mongodb";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  calories: z.number().min(0).optional(),
  proteins: z.number().min(0).optional(),
  grams: z.number().min(0).optional(),
  categoryId: z.string().transform(objectIdTransform).optional(),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "update-ingredients")) {
    throw createError({ statusCode: 403, message: "Unauthorized" });
  }

  const userId = await getUserId(event);

  // Validate the request body
  const { categoryId, ...validatedBody } = await zodValidateBody(
    event,
    updateSchema.parse,
  );
  const ingredientIdParam = getRouterParam(event, "id");

  if (!userId) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  if (!ObjectId.isValid(ingredientIdParam)) {
    throw createError({
      statusCode: 400,
      message: "Invalid ingredient ID",
    });
  }

  const ingredientId = new ObjectId(ingredientIdParam);

  const category = categoryId
    ? await ModelCategories.findOne({
        _id: new ObjectId(categoryId),
      })
    : undefined;

  if (categoryId && !category) {
    throw createError({
      statusCode: 404,
      message: "Category not found",
    });
  }

  // Find and update the ingredient
  // Ensure the ingredient belongs to the specified category and user
  if (
    can(user, "update-all-ingredients") ||
    !can(user, "update-template-ingredients")
  ) {
    const updatedIngredient = await ModelIngredients.findOneAndUpdate(
      can(user, "update-all-ingredients")
        ? {
            _id: ingredientId,
          }
        : {
            _id: ingredientId,
            userId,
          },
      { $set: { ...validatedBody, categoryId } },
      { new: true }, // Return the updated document
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
        },
      },
      {
        $lookup: {
          from: ModelCategories.modelName,
          localField: "categoryId",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $match: {
          $or: [
            { "categories.templateId": { $exists: true, $ne: null } },
            { userId },
          ],
        },
      },
    ]);

    if (ingredients.length === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }

    const updated = await ModelCategories.findOneAndUpdate(
      { _id: ingredientId },
      { $set: { ...validatedBody, categoryId } },
      { new: true },
    );

    return updated;
  }
});
