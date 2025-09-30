const querySchema = z.object({
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
});

export default defineEventHandler(async (event) => {
  const { offset = 0, limit = 10 } = getQuery(event);
  const categoryId = getRouterParam(event, "id");
  const userId = await getUserId(event);

  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);

  await zodValidateData(
    {
      offset: convertedOffset,
      limit: convertedLimit,
    },
    querySchema.parse
  );

  return ModelIngredients.find({ categoryId, userId })
    .limit(convertedLimit)
    .skip(convertedOffset);
});
