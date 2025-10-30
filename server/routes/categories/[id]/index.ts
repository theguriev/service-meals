import { ObjectId } from "mongodb";
import { PipelineStage } from "mongoose";
import { z } from "zod";

const querySchema = z.object({
  withIngredients: z.coerce.boolean().default(false)
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const { withIngredients } = await zodValidateData(getQuery(event), querySchema.parse);
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
      from: ModelIngredients.modelName,
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
    ...(withIngredients ? [ingredientsLookup] : []),
  ]).limit(1))[0];
  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: "Category not found",
    });
  }

  return category;
});
