const measurementSchema = z.object({
  timestamp: z.number().default(() => Date.now()),
  type: z.string(),
  meta: z.record(z.any()).default({}),
});

export default eventHandler(async (event) => {
  const _id = await getUserId(event);
  const measurement = await zodValidateBody(event, measurementSchema.parse);

  const measurementDoc = new ModelMeasurement({
    userId: _id,
    ...measurement,
  });

  const savedMeasurement = await measurementDoc.save();
  return {
    success: true,
    measurement: savedMeasurement,
  };
});
