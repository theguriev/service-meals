const querySchema = z.object({
  type: z.string(),
  sort: z.enum(["asc", "desc"]).default("asc"),
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
});

export default eventHandler(async (event) => {
  const _id = await getUserId(event);
  const { type, sort, offset, limit } = getQuery(event);
  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);
  await zodValidateData(
    {
      type,
      sort,
      offset: convertedOffset,
      limit: convertedLimit,
    },
    querySchema.parse
  );

  const measurements = await ModelMeasurement.find({ type, userId: _id })
    .sort({ createdAt: sort === "asc" ? 1 : -1 })
    .skip(convertedOffset)
    .limit(convertedLimit);

  return {
    success: true,
    measurements,
  };
});
