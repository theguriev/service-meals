const validationSchema = z.object({
  ingredients: z
    .array(
      z.object({
        id: z.string().min(1, "Ingredient id is required"),
        value: z.number(),
      })
    )
    .min(1, "At least one ingredient is required"),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const validatedBody = await zodValidateBody(event, validationSchema.parse);

  const doc = new ModelSets({
    userId,
    ...validatedBody,
  });

  const saved = await doc.save();

  return {
    message: "Set added successfully",
    data: saved,
  };
});
