
const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.number().min(0, "Calories must be a positive number"),
  proteins: z.number().min(0, "Proteins must be a positive number"),
  grams: z.number().min(0, "Grams must be a positive number"),
  categoryId: z.string().transform(objectIdTransform),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const { categoryId, ...validatedBody } = await zodValidateBody(event, validationSchema.parse);

  // Check if the category exists and belongs to the user
  const category = await ModelCategories.findOne({
    _id: categoryId,
    userId,
  });
  if (!category) {
    throw createError({
      statusCode: 404,
      message: "Category not found or access denied",
    });
  }

  const doc = new ModelIngredients({
    userId,
    categoryId,
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
