import { defaultTemplateName } from "~~/constants";

const querySchema = z.object({
  offset: z.number().int().default(0),
  limit: z.number().int().default(10),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "get-all-templates")) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const { offset = 0, limit = 100 } = getQuery(event);
  const convertedOffset = Number(offset);
  const convertedLimit = Number(limit);

  await zodValidateData(
    {
      offset: convertedOffset,
      limit: convertedLimit,
    },
    querySchema.parse
  );
  return ModelTemplate.find({
    name: { $ne: defaultTemplateName }
  }).limit(convertedLimit).skip(convertedOffset);
});
