import { defaultTemplateName, templateUserId } from "~~/constants";

const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "create-templates")) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const validatedBody = await zodValidateBody(event, validationSchema.parse);

  if (validatedBody.name === defaultTemplateName) {
    throw createError({ statusCode: 400, message: "Cannot use default template name" });
  }

  const doc = new ModelTemplate({
    userId: user._id.toString(),
    ...validatedBody,
  });
  const saved = await doc.save();

  let templateData = (await ModelTemplate.aggregate([
    { $match: { name: defaultTemplateName } },
    {
      $lookup: {
        from: ModelCategories.modelName,
        localField: "_id",
        foreignField: "templateId",
        pipeline: [
          {
            $lookup: {
              from: ModelIngredients.modelName,
              localField: "_id",
              foreignField: "categoryId",
              as: "ingredients",
            },
          },
        ],
        as: "categories",
      },
    },
  ]))?.[0];

  if (!templateData) {
    templateData = await ModelTemplate.create({
      name: defaultTemplateName,
      userId: templateUserId,
    });
  }

  for (const category of (templateData.categories || [])) {
    const newCategory = new ModelCategories({
      userId: user._id.toString(),
      name: category.name,
      templateId: saved._id,
    });
    const savedCategory = await newCategory.save();

    for (const ingredient of category.ingredients) {
      const newIngredient = new ModelIngredients({
        userId: user._id.toString(),
        categoryId: savedCategory._id,
        name: ingredient.name,
        calories: ingredient.calories,
        proteins: ingredient.proteins,
        grams: ingredient.grams,
        unit: ingredient.unit,
        isAlcohol: ingredient.isAlcohol,
      });
      await newIngredient.save();
    }
  }

  return {
    message: "Item added successfully",
    data: saved,
  };
});
