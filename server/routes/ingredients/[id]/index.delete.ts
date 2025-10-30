import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "delete-ingredients")) {
    throw createError({ statusCode: 403, message: "Unauthorized" });
  }

  const userId = await getUserId(event);
  const idParam = getRouterParam(event, "id");

  if (!ObjectId.isValid(idParam)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const id = new ObjectId(idParam);

  // Check if the category exists and belongs to the user
  if (can(user, "delete-all-ingredients") || !can(user, "delete-template-ingredients")) {
    const result = await ModelIngredients.deleteOne(can(user, "delete-all-ingredients") ? {
      _id: id,
    } : {
      _id: id,
      userId,
    });

    if (result.deletedCount === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }
  } else {
    const ingredients = await ModelIngredients.aggregate([
      {
        $match: {
          _id: id,
        }
      },
      {
        $lookup: {
          from: ModelCategories.modelName,
          localField: "categoryId",
          foreignField: "_id",
          as: "categories"
        }
      },
      {
        $match: {
          $or: [
            { "categories.templateId": { $exists: true, $ne: null } },
            { userId }
          ]
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
