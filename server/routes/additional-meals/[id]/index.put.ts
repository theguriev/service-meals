import { ObjectId } from "mongodb";

const updateSchema = z.object({
  content: z.string().nonempty("Content is required"),
});

export default defineEventHandler(async (event) => {
  const userId = new ObjectId(await getUserId(event) as string);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid additional meal ID" });
  }

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the set in the database
  const updated = await ModelAdditionalMeals.findOneAndUpdate(
    { _id: id, userId },
    { $set: validatedBody },
    { new: true }
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "Additional meal not found" });
  }

  return {
    message: "Additional meal updated successfully",
    data: updated,
  };
});
