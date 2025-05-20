const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const mealId = getRouterParam(event, "mealId");
  const validatedBody = await zodValidateBody(event, validationSchema.parse);
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
