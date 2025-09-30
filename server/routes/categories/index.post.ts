const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mealId: z.string().transform(objectIdTransform)
});

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const { mealId, ...validatedBody } = await zodValidateBody(event, validationSchema.parse);
  const doc = new ModelCategories({
    userId: _id,
    mealId,
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
