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
      return {
        message: "No applied template found for user",
        data: {
          userId,
          removed: {
            categories: 0,
            ingredients: 0,
          },
        },
      };
    }

    const userCategoryNames = userCategories.map((category) => category.name);

    const allTemplates = await ModelTemplate.aggregate([
      {
        $lookup: {
          from: ModelCategories.modelName,
          localField: "_id",
          foreignField: "templateId",
          as: "categories",
        },
      },
    ]);

    let matchedTemplate = null;
    for (const template of allTemplates) {
      const templateCategoryNames = template.categories.map(
        (cat: { name: string }) => cat.name
      );
      
      const allMatch = templateCategoryNames.every((name: string) =>
        userCategoryNames.includes(name)
      );
      
      if (allMatch && templateCategoryNames.length === userCategoryNames.length) {
        matchedTemplate = template;
        break;
      }
    }

    if (!matchedTemplate) {
      return {
        message: "No matching template found",
        data: {
          userId,
          removed: {
            categories: 0,
            ingredients: 0,
          },
        },
      };
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
        templateId: matchedTemplate._id.toString(),
        userId,
        removed: {
          categories: deletedCategories.deletedCount,
          ingredients: deletedIngredients.deletedCount,
        },
        summary: {
          templateName: matchedTemplate.name,
          removedAt: new Date().toISOString(),
        },
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

