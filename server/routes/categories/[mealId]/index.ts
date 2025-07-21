const querySchema = z.object({
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
});

export default defineEventHandler(async (event) => {
  const { offset = 0, limit = 10 } = getQuery(event);
  const mealId = getRouterParam(event, "mealId");
  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);
  const userId = await getUserId(event);
  const role = await getRole(event);

  await zodValidateData(
    {
      offset: convertedOffset,
      limit: convertedLimit,
    },
    querySchema.parse
  );
  const categoriesRaw = await ModelCategories.find(role === "admin" ? { mealId } : { mealId, userId })
    .limit(convertedLimit)
    .skip(convertedOffset);
  return await Promise.all(
    categoriesRaw.map(async (category: any) => {
      const ingredients = await ModelIngredients.find(role === "admin"
        ? { categoryId: category._id }
        : {
          categoryId: category._id,
          userId,
        }
      );
      return { ...category.toObject(), ingredients };
    })
  );
});
