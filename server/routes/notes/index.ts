const querySchema = z.object({
  offset: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(10),
  search: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD format
  includeAllDates: z.coerce.boolean().default(false),
});

const getFilter = (search: string, userId: string, date: string | undefined, includeAllDates: boolean) => {
  const filter: any = { userId };

  // Add search filter
  if (search) {
    filter.content = { $regex: search, $options: "i" };
  }

  // Add date filter - by default filter by today's date unless includeAllDates is true
  if (!includeAllDates) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    filter.createdAt = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  return filter;
};

export default defineEventHandler(async (event) => {
  const { offset, limit, search, date, includeAllDates } = await zodValidateData(
    getQuery(event),
    querySchema.parse
  );

  const userId = await getUserId(event);

  return ModelNotes.find(getFilter(search, userId, date, includeAllDates))
    .limit(limit)
    .skip(offset)
    .sort({ updatedAt: -1 });
});
