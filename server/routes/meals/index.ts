const querySchema = z.object({
  offset: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(10),
  templateId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { offset, limit, templateId } = await zodValidateData(
    getQuery(event),
    querySchema.parse
  );

  // Assuming getUserId is a utility function to get the current user's ID
  const userId = await getUserId(event);
  const role = await getRole(event);

  if (templateId && role != "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Forbidden - Admin access required for templateId filter",
    });
  }

  return ModelMeals.find(templateId ? { templateId } : {
      userId,
      templateId: null,
    })
    .limit(limit)
    .skip(offset);
});
