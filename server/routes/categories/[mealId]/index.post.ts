const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "create-meals")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const mealId = getRouterParam(event, "mealId");
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

  const _id = await getUserId(event);
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
