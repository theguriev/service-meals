import { ObjectId } from "mongodb";

const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.number().min(0, "Calories must be a positive number"),
  proteins: z.number().min(0, "Proteins must be a positive number"),
  grams: z.number().min(0, "Grams must be a positive number"),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const categoryId = getRouterParam(event, "categoryId");
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);

  if (!can(user, "create-ingredients")) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!ObjectId.isValid(categoryId)) {
    throw createError({ statusCode: 400, message: "Invalid Category ID" });
  }

  // Check if the category exists and belongs to the user
  const category = await ModelCategories.findOne({
    _id: new ObjectId(categoryId),
  });
  if (!category) {
    throw createError({
      statusCode: 404,
      message: "Category not found",
    });
  }

  const meal = await ModelMeals.findById(category.mealId);
  if (!meal) {
    throw createError({
      statusCode: 404,
      message: "Meal not found",
    });
  }

  if (meal.templateId && !can(user, "create-template-ingredients")) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  const validatedBody = await zodValidateBody(event, validationSchema.parse);

  const doc = new ModelIngredients({
    userId,
    categoryId: categoryId,
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
