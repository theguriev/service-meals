const validationSchema = z.object({
  ids: z.string().min(1, "IDs are required"),
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
