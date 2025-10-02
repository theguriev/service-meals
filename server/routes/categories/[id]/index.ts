import { ObjectId } from "mongodb";
import { PipelineStage } from "mongoose";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");
  const user = await getInitialUser(event, authorizationBase);

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const categoryMatch = can(user, "get-all-categories") ? { _id: new ObjectId(id) } : {
    _id: new ObjectId(id),
    userId,
  };

  const ingredientsLookup: PipelineStage = {
    $lookup: {
      from: "ingredients",
      localField: "_id",
      foreignField: "categoryId",
      as: "ingredients"
    }
  }

  if (!can(user, "get-all-ingredients")) {
    ingredientsLookup.$lookup.pipeline = [
      { $match: { userId } }
    ];
  }

  const category = (await ModelCategories.aggregate([
    { $match: categoryMatch },
    ingredientsLookup,
  ]).limit(1))[0];
  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: "Category not found",
    });
  }

  return category;
});
