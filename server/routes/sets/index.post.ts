import validateSet from "~/utils/validateSet";

const validationSchema = z.object({
  ingredients: z
    .array(
      z.object({
        id: z.string().min(1, "Ingredient id is required"),
        value: z.number(),
        additionalInfo: z.string().optional(),
      })
    )
    .min(1, "At least one ingredient is required"),
});

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const validatedBody = await zodValidateBody(event, validationSchema.parse);

  const ids = validatedBody.ingredients?.map((i) => i.id);
  if (ids.length !== new Set(ids).size) {
    throw createError({
      statusCode: 400,
      message: "Duplicate ingredient IDs are not allowed",
    });
  }

  if (!(await validateSet(validatedBody.ingredients))) {
    throw createError({
      statusCode: 400,
      message: "Invalid ingredient values per category",
    });
  }

  const doc = new ModelSets({
    userId,
    ...validatedBody,
  });

  const saved = await doc.save();

  return {
    message: "Set added successfully",
    data: saved,
  };
});
