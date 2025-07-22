const querySchema = z.object({
  offset: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(10),
  search: z.string().optional(),
});

const getFilter = (search: string, userId: string) => {
  if (!search) {
    return { userId };
  }

  return {
    userId,
    content: { $regex: search, $options: "i" },
  };
};

export default defineEventHandler(async (event) => {
  const { offset, limit, search } = await zodValidateData(
    getQuery(event),
    querySchema.parse
  );

  const userId = await getUserId(event);

  return ModelNotes.find(getFilter(search, userId))
    .limit(limit)
    .skip(offset)
    .sort({ updatedAt: -1 });
});
