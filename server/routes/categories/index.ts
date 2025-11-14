import { InferSchemaType, RootFilterQuery } from "mongoose";

const querySchema = z.object({
	offset: z.coerce.number().int().default(0),
	limit: z.coerce.number().int().default(10),
	all: z.coerce.boolean().default(false),
	showInTemplate: z.coerce.boolean().default(false),
});

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const { offset, limit, all, showInTemplate } = await zodValidateData(
		getQuery(event),
		querySchema.parse,
	);
	const userId = await getUserId(event);
	const user = await getInitialUser(event, authorizationBase);

	if (all && !can(user, "get-all-categories"))
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });

	const match: RootFilterQuery<InferSchemaType<typeof schemaCategories>> =
		!showInTemplate
			? {
					templateId: { $not: { $exists: true, $ne: null } },
				}
			: {};

	return ModelCategories.find(all ? match : { ...match, userId })
		.limit(limit)
		.skip(offset);
});
