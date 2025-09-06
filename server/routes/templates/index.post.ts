const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "create-templates")) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const validatedBody = await zodValidateBody(event, validationSchema.parse);
  const doc = new ModelTemplate({
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
