const querySchema = z.object({
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
});

export default defineEventHandler(async (event) => {
  const { offset = 0, limit = 10 } = getQuery(event);
  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);

  // Assuming getUserId is a utility function to get the current user's ID
  const userId = await getUserId(event);

  await zodValidateData(
    {
      offset: convertedOffset,
      limit: convertedLimit,
    },
    querySchema.parse
  );
  return ModelMeals.find({ userId })
    .limit(convertedLimit)
    .skip(convertedOffset);
});
