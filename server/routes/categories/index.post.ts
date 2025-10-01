const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mealId: z.string().transform(objectIdTransform)
});

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const { mealId, ...validatedBody } = await zodValidateBody(event, validationSchema.parse);
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "create-meals")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const meal = await ModelMeals.findById(mealId);
  if (!meal) {
    throw createError({
      statusCode: 404,
      statusMessage: "Meal not found",
    });
  }

  if (meal.templateId && !can(user, "create-template-categories")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
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
