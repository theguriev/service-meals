
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
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "create-ingredients")) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  // Check if the category exists and belongs to the user
  const category = await ModelCategories.findById(categoryId);
  if (!category) {
    throw createError({
      statusCode: 404,
      message: "Category not found",
    });
  }

  if (category.templateId && !can(user, "create-template-ingredients")) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
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
