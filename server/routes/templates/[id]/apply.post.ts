import { ObjectId } from "mongodb";

const validationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export default defineEventHandler(async (event) => {
  const logger = await getLogger(event);
  const role = await getRole(event);
  if (role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const templateId = getRouterParam(event, "id");
  if (!ObjectId.isValid(templateId)) {
    throw createError({ statusCode: 400, message: "Invalid template ID" });
  }

  const validatedBody = await zodValidateBody(event, validationSchema.parse);
  const { userId } = validatedBody;

  try {
    // 1. Находим template с полной структурой данных
    const templateData = await ModelTemplate.aggregate([
      { $match: { _id: new ObjectId(templateId) } },
      {
        $lookup: {
          from: "meals",
          localField: "_id",
          foreignField: "templateId",
          as: "meals",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "meals._id",
          foreignField: "mealId",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "ingredients",
          localField: "categories._id",
          foreignField: "categoryId",
          as: "ingredients",
        },
      },
      {
        $addFields: {
          meals: {
            $map: {
              input: "$meals",
              as: "meal",
              in: {
                $mergeObjects: [
                  "$$meal",
                  {
                    categories: {
                      $filter: {
                        input: "$categories",
                        cond: { $eq: ["$$this.mealId", "$$meal._id"] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          meals: {
            $map: {
              input: "$meals",
              as: "meal",
              in: {
                $mergeObjects: [
                  "$$meal",
                  {
                    categories: {
                      $map: {
                        input: "$$meal.categories",
                        as: "category",
                        in: {
                          $mergeObjects: [
                            "$$category",
                            {
                              ingredients: {
                                $filter: {
                                  input: "$ingredients",
                                  cond: {
                                    $eq: [
                                      "$$this.categoryId",
                                      "$$category._id",
                                    ],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          categories: 0,
          ingredients: 0,
        },
      },
    ]);

    if (!templateData || templateData.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Template not found",
      });
    }

    const template = templateData[0];
    const createdMeals = [];
    const createdCategories = [];
    const createdIngredients = [];

    for (const meal of template.meals) {
      const newMeal = new ModelMeals({
        userId,
        name: meal.name,
        templateId: null,
      });
      const savedMeal = await newMeal.save();
      createdMeals.push(savedMeal);

      for (const category of meal.categories) {
        const newCategory = new ModelCategories({
          userId,
          mealId: savedMeal._id,
          name: category.name,
        });
        const savedCategory = await newCategory.save();
        createdCategories.push(savedCategory);

        for (const ingredient of category.ingredients) {
          const newIngredient = new ModelIngredients({
            userId,
            categoryId: savedCategory._id,
            name: ingredient.name,
            calories: ingredient.calories,
            proteins: ingredient.proteins,
            grams: ingredient.grams,
          });
          const savedIngredient = await newIngredient.save();
          createdIngredients.push(savedIngredient);
        }
      }
    }

    return {
      message: "Template applied successfully",
      data: {
        templateId,
        userId,
        applied: {
          meals: createdMeals.length,
          categories: createdCategories.length,
          ingredients: createdIngredients.length,
        },
        createdMeals,
        summary: {
          templateName: template.name,
          appliedAt: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    logger.error({ message: "Error applying template:", error });

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to apply template",
      data: error.message,
    });
  }
});
