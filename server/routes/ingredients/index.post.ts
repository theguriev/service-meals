const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.number().min(0, "Calories must be a positive number"),
  meta: z.record(z.any()).default({}),
});

export default eventHandler(async (event) => {
  const _id = await getUserId(event);

  // Validate the request body
  const validatedBody = await zodValidateBody(event, ingredientSchema.parse);

  // Create a new ingredient in the database
  const ingredientDoc = new ModelIngredients({
    userId: _id,
    ...validatedBody,
  });
  const savedIngredient = await ingredientDoc.save();

  return {
    message: "Ingredient added successfully",
    ingredient: savedIngredient,
  };
});
