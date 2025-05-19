const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const validatedBody = await zodValidateBody(event, validationSchema.parse);
  const doc = new ModelMeals({
    userId: _id,
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
