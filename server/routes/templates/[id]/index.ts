import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "get-all-templates")) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const populated = await ModelTemplate.aggregate([
    { $match: { _id: new ObjectId(id) } },
    {
      $lookup: {
        from: "meals",
        localField: "_id",
        foreignField: "templateId",
        as: "meals",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "meals._id",
        foreignField: "mealId",
        as: "categories",
      },
    },
    {
      $lookup: {
        from: "ingredients",
        localField: "categories._id",
        foreignField: "categoryId",
        as: "ingredients",
      },
    },
    {
      $addFields: {
        meals: {
          $map: {
            input: "$meals",
            as: "meal",
            in: {
              $mergeObjects: [
                "$$meal",
                {
                  categories: {
                    $filter: {
                      input: "$categories",
                      cond: { $eq: ["$$this.mealId", "$$meal._id"] },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        meals: {
          $map: {
            input: "$meals",
            as: "meal",
            in: {
              $mergeObjects: [
                "$$meal",
                {
                  categories: {
                    $map: {
                      input: "$$meal.categories",
                      as: "category",
                      in: {
                        $mergeObjects: [
                          "$$category",
                          {
                            ingredients: {
                              $filter: {
                                input: "$ingredients",
                                cond: {
                                  $eq: ["$$this.categoryId", "$$category._id"],
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        categories: 0,
        ingredients: 0,
      },
    },
  ]);

  if (!populated || populated.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Item not found",
    });
  }

  return populated[0];
});
