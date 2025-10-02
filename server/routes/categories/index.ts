const querySchema = z.object({
  offset: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(10),
  all: z.coerce.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const { offset, limit, all } = await zodValidateData(getQuery(event), querySchema.parse);
  const userId = await getUserId(event);
  const user = await getInitialUser(event, authorizationBase);

  if (all && !can(user, "get-all-categories"))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  return ModelCategories.find(all ? {} : { userId })
    .limit(limit)
    .skip(offset);
});
