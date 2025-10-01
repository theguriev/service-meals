import { PipelineStage, Types } from "mongoose";

const querySchema = z.object({
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const { offset = 0, limit = 10 } = getQuery(event);
  const mealId = new Types.ObjectId(getRouterParam(event, "mealId"));
  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);
  const userId = await getUserId(event);
  const user = await getInitialUser(event, authorizationBase);

  await zodValidateData(
    {
      offset: convertedOffset,
      limit: convertedLimit,
    },
    querySchema.parse
  );

  const ingredientsLookup: PipelineStage = {
    $lookup: {
      from: "ingredients",
      localField: "_id",
      foreignField: "categoryId",
      as: "ingredients"
    }
  };

  if (!can(user, "get-all-ingredients")) {
    ingredientsLookup.$lookup.pipeline = [{
      $match: { userId }
    }];
  }

  const categoriesRaw = await ModelCategories.aggregate([
    {
      $match: can(user, "get-all-categories") ? { mealId } : { mealId, userId }
    },
    ingredientsLookup,
    {
      $limit: convertedLimit
    },
    {
      $skip: convertedOffset
    }
  ]);
  return categoriesRaw;
});
