const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  templateId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  const { templateId, ...validatedBody } = await zodValidateBody(event, validationSchema.parse);

  if (!can(user, "create-meals") || templateId && !can(user, "create-template-meals")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const _id = await getUserId(event);
  const doc = new ModelMeals({
    userId: _id,
    templateId,
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
