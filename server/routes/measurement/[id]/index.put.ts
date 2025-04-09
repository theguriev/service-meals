import { z } from "zod";

const updateMeasurementSchema = z.object({
  timestamp: z.number().default(() => Date.now()),
  type: z.string(),
  meta: z.record(z.any()),
});

export default eventHandler(async (event) => {
  const _id = await getUserId(event);
  const measurementId = getRouterParam(event, "id");
  const updateData = await zodValidateBody(
    event,
    updateMeasurementSchema.parse
  );

  try {
    const updatedMeasurement = await ModelMeasurement.findOneAndUpdate(
      { _id: measurementId, userId: _id },
      { $set: updateData },
      { new: true }
    );
    return {
      success: true,
      measurement: updatedMeasurement,
    };
  } catch (error) {
    throw createError({
      message: "Measurement not found",
      status: 404,
    });
  }
});
