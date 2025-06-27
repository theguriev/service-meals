const validationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default defineEventHandler(async (event) => {
  const role = await getRole(event);
  if (role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const validatedBody = await zodValidateBody(event, validationSchema.parse);
  const doc = new ModelTemplate({
    ...validatedBody,
  });
  const saved = await doc.save();

  return {
    message: "Item added successfully",
    data: saved,
  };
});
