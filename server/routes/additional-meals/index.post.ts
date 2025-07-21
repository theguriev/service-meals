import { Types } from "mongoose";

const validationSchema = z.object({
  content: z.string().nonempty("Content is required"),
});

export default defineEventHandler(async (event) => {
  const userId = new Types.ObjectId(await getUserId(event) as string);
  const validatedBody = await zodValidateBody(event, validationSchema.parse);

  const doc = new ModelAdditionalMeals({
    userId,
    ...validatedBody,
  });

  const saved = await doc.save();

  return {
    message: "Additional meal added successfully",
    data: saved,
  };
});
