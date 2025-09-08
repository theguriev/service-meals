import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "delete-ingredients")) {
    throw createError({ statusCode: 403, message: "Unauthorized" });
  }

  const userId = await getUserId(event);
  const id = new ObjectId(getRouterParam(event, "id"));
  const categoryId = new ObjectId(getRouterParam(event, "categoryId"));

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  // Check if the category exists and belongs to the user
  if (can(user, "delete-all-ingredients") || !can(user, "delete-template-ingredients")) {
    const result = await ModelIngredients.deleteOne(can(user, "delete-all-ingredients") ? {
      _id: id,
      categoryId,
    } : {
      _id: id,
      userId,
      categoryId,
    });

    if (result.deletedCount === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }
  } else {
    const ingredients = await ModelIngredients.aggregate([
      {
        $match: {
          _id: id,
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

    await ModelIngredients.deleteOne({
      _id: id,
    });
  }

  return { message: "Item deleted successfully" };
});
