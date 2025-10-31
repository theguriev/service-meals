const validationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "remove-templates")) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const validatedBody = await zodValidateBody(event, validationSchema.parse);
  const { userId } = validatedBody;

  try {
    const userCategories = await ModelCategories.find({
      userId,
      templateId: null,
    });

    if (userCategories.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No applied template found for user",
      });
    }

    const userCategoryIds = userCategories.map((category) => category._id);

    const deletedIngredients = await ModelIngredients.deleteMany({
      categoryId: { $in: userCategoryIds },
    });

    const deletedCategories = await ModelCategories.deleteMany({
      _id: { $in: userCategoryIds },
      userId,
    });

    return {
      message: "Applied template removed successfully",
      data: {
        userId,
        removed: {
          categories: deletedCategories.deletedCount,
          ingredients: deletedIngredients.deletedCount,
        },
        removedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error removing applied template:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to remove applied template",
      data: error.message,
    });
  }
});

