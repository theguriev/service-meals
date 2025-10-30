import { defaultTemplateName, templateUserId } from "~~/constants";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "get-all-templates")) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const populated = await ModelTemplate.aggregate([
    { $match: { name: defaultTemplateName } },
    {
      $lookup: {
        from: ModelCategories.modelName,
        localField: "_id",
        foreignField: "templateId",
        pipeline: [
          {
            $lookup: {
              from: ModelIngredients.modelName,
              localField: "_id",
              foreignField: "categoryId",
              as: "ingredients",
            },
          },
        ],
        as: "categories",
      },
    },
  ]);

  if (!populated || populated.length === 0) {
    const newTemplate = await ModelTemplate.create({
      name: defaultTemplateName,
      userId: templateUserId,
    });
    return {
      ...newTemplate.toObject(),
      categories: [],
    };
  }

  return populated[0];
});
