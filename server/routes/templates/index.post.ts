const templateSchema = z.object({
  timestamp: z.number().default(() => Date.now()),
  name: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
      timestamp: z.number().default(() => Date.now()),
      id: z.string(),
      ingredients: z.array(z.string()),
    })
  ),
});

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const validatedBody = await zodValidateBody(event, templateSchema.parse);
  const templateDoc = new ModelTemplates({
    userId: _id,
    ...validatedBody,
  });
  const saved = await templateDoc.save();

  return {
    message: "Template added successfully",
    template: saved,
  };
});
