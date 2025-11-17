import { templateUserId } from "~~/constants";

export default defineTask({
	meta: {
		name: "db:clear-templates",
		description: "Clear all templates and related data from database",
	},
	run: async ({ payload, context }) => {
		try {
			console.log("🚀 Starting database cleanup for templates...");

			const confirmCleanup = payload?.confirm === true;

			if (!confirmCleanup) {
				console.log(
					"⚠️  This will delete ALL templates, categories and ingredients!",
				);
				console.log("⚠️  To confirm, run with: --payload '{\"confirm\": true}'");
				return {
					result: {
						cancelled: true,
						cleaned: false,
						message: "Cleanup cancelled - confirmation required",
						deletedTemplates: 0,
						deletedCategories: 0,
						deletedIngredients: 0,
						totalDeleted: 0,
					},
				};
			}

			// Подсчитываем что будем удалять
			const templatesCount = await ModelTemplate.find({
				userId: templateUserId,
			}).countDocuments();
			const categoriesCount = await ModelCategories.find({
				userId: templateUserId,
			}).countDocuments();
			const ingredientsCount = await ModelIngredients.find({
				userId: templateUserId,
			}).countDocuments();

			console.log("📊 Current database state:");
			console.log(`   🏷️  Templates: ${templatesCount}`);
			console.log(`   📂 Categories: ${categoriesCount}`);
			console.log(`   🥗 Ingredients: ${ingredientsCount}`);

			if (templatesCount === 0) {
				console.log("✅ Database is already clean!");
				return {
					result: {
						cancelled: false,
						cleaned: false,
						message: "Database was already clean",
						deletedTemplates: 0,
						deletedCategories: 0,
						deletedIngredients: 0,
						totalDeleted: 0,
					},
				};
			}

			console.log("\n🗑️  Starting cleanup...");

			// Удаляем в правильном порядке (от детей к родителям)
			const deletedIngredients = await ModelIngredients.deleteMany({
				userId: templateUserId,
			});
			console.log(
				`   🥗 Deleted ${deletedIngredients.deletedCount} ingredients`,
			);

			const deletedCategories = await ModelCategories.deleteMany({
				userId: templateUserId,
			});
			console.log(`   📂 Deleted ${deletedCategories.deletedCount} categories`);

			const deletedTemplates = await ModelTemplate.deleteMany({
				userId: templateUserId,
			});
			console.log(`   🏷️  Deleted ${deletedTemplates.deletedCount} templates`);

			console.log("\n✅ Database cleanup completed successfully!");
			console.log("💡 You can now run fresh migrations with: pnpm migrate");

			return {
				result: {
					cancelled: false,
					cleaned: true,
					message: "Database cleanup completed successfully!",
					deletedTemplates: deletedTemplates.deletedCount,
					deletedCategories: deletedCategories.deletedCount,
					deletedIngredients: deletedIngredients.deletedCount,
					totalDeleted:
						deletedTemplates.deletedCount +
						deletedCategories.deletedCount +
						deletedIngredients.deletedCount,
				},
			};
		} catch (error) {
			console.error("❌ Cleanup failed:", error);
			throw error;
		}
	},
});
