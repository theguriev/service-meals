const querySchema = z.object({
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export default defineEventHandler(async (event) => {
  const { offset = 0, limit = 10, startDate, endDate } = getQuery(event);
  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);

  await zodValidateData(
    {
      offset: convertedOffset,
      limit: convertedLimit,
      startDate,
      endDate,
    },
    querySchema.parse
  );

  return ModelSets.find(buildDateFilter(startDate as string, endDate as string))
    .limit(convertedLimit)
    .skip(convertedOffset);
});
