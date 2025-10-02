import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "delete-categories")) {
    throw createError({ statusCode: 403, message: "Unauthorized" });
  }

  const _id = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }
  const objectId = new ObjectId(id);

  if (can(user, "delete-all-categories") || !can(user, "delete-template-categories")) {
    const result = await ModelCategories.deleteOne(can(user, "delete-all-categories") ? {
      _id: objectId,
    } : {
      _id: objectId,
      userId: _id,
    });

    if (result.deletedCount === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }
  } else {
    const categories = await ModelCategories.aggregate([
      {
        $match: {
          _id: objectId,
        }
      },
      {
        $lookup: {
          from: "meals",
          localField: "mealId",
          foreignField: "_id",
          as: "meals"
        }
      },
      {
        $match: {
          $or: [
            { "meals.templateId": { $exists: true, $ne: null } },
            { userId: _id }
          ]
        }
      }
    ]);

    if (categories.length === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }

    await ModelCategories.deleteOne({
      _id: objectId,
    });
  }

  await ModelIngredients.deleteMany({
    categoryId: objectId,
  })

  return { message: "Item deleted successfully" };
});
