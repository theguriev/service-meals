import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import mongoose, { connect } from "mongoose";
import { defaultTemplateName, templateUserId } from "~~/constants";

interface TemplateIngredient {
  name: string;
  calories: number;
  proteins: number;
  grams?: number;
}

interface TemplateCategory {
  name: string;
  description?: string;
  targetCalories?: number;
  ingredients: TemplateIngredient[];
}

interface TemplateData {
  name?: string;
  description?: string;
  categories: TemplateCategory[];
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateFilename(templateName: string): string {
  if (templateName === defaultTemplateName) {
    return "default.json";
  }
  return `${sanitizeFilename(templateName)}.json`;
}

export default defineTask({
  meta: {
    name: "db:export-templates",
    description: "Export all templates from database to JSON files in data/templates format",
  },
  run: async () => {
    try {
      console.log("🚀 Starting template export from database...");

      const mongoUri = process.env.NITRO_MONGO_URI || "mongodb://root:donotusemyrootpassword@localhost:27017/";
      try {
        if (mongoose.connection.readyState === 0) {
          console.log("🔌 Connecting to MongoDB...");
          await connect(mongoUri);
          console.log("✅ Connected to MongoDB");
        } else {
          console.log("✅ MongoDB already connected");
        }
      } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        throw error;
      }

      const templatesDir = join(process.cwd(), "data", "templates");
      try {
        await mkdir(templatesDir, { recursive: true });
      } catch (error) {
        console.error("❌ Failed to create templates directory:", error);
        throw error;
      }

      const templates = await ModelTemplate.find({
        $or: [{ userId: templateUserId }, { userId: { $exists: false } }],
      });

      if (templates.length === 0) {
        console.log("⚠️  No templates found in database");
        return {
          result: "No templates found",
          exportedCount: 0,
          exportedTemplates: [],
        };
      }

      console.log(`📁 Found ${templates.length} template(s) in database`);

      const exportedTemplates = [];
      let exportedCount = 0;
      let errorCount = 0;

      for (const template of templates) {
        try {
          console.log(`\n📋 Processing template: ${template.name}`);

          const populated = await ModelTemplate.aggregate([
            { $match: { _id: template._id } },
            {
              $lookup: {
                from: ModelCategories.modelName,
                localField: "_id",
                foreignField: "templateId",
                pipeline: [
                  {
                    $lookup: {
                      from: ModelIngredients.modelName,
                      localField: "_id",
                      foreignField: "categoryId",
                      pipeline: [
                        {
                          $sort: { createdAt: 1 }, 
                        },
                      ],
                      as: "ingredients",
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      description: 1,
                      targetCalories: 1,
                      createdAt: 1,
                      ingredients: {
                        name: 1,
                        calories: 1,
                        proteins: 1,
                        grams: 1,
                        createdAt: 1, 
                      },
                    },
                  },
                  {
                    $sort: { createdAt: 1 },
                  },
                ],
                as: "categories",
              },
            },
            {
              $project: {
                name: 1,
                description: 1,
                categories: 1,
              },
            },
          ]);

          if (!populated || populated.length === 0) {
            console.log(`⚠️  Template "${template.name}" has no data, skipping...`);
            continue;
          }

          const templateData = populated[0];

          const exportData: TemplateData = {
            categories: [],
          };

          if (templateData.name && templateData.name !== defaultTemplateName) {
            exportData.name = templateData.name;
          }

          if (templateData.description !== undefined && templateData.description !== null && templateData.description !== "") {
            exportData.description = templateData.description;
          }

          for (const category of templateData.categories || []) {
            const categoryData: TemplateCategory = {
              name: category.name,
              ingredients: [],
            };

            if (category.description !== undefined && category.description !== null && category.description !== "") {
              categoryData.description = category.description;
            }
            if (category.targetCalories !== undefined && category.targetCalories !== null) {
              categoryData.targetCalories = category.targetCalories;
            }

            for (const ingredient of category.ingredients || []) {
              const ingredientData: TemplateIngredient = {
                name: ingredient.name,
                calories: ingredient.calories,
                proteins: ingredient.proteins,
              };

              if (ingredient.grams !== undefined && ingredient.grams !== null) {
                ingredientData.grams = ingredient.grams;
              }

              categoryData.ingredients.push(ingredientData);
            }

            exportData.categories.push(categoryData);
          }

          const filename = generateFilename(template.name);
          const filePath = join(templatesDir, filename);

          await writeFile(filePath, JSON.stringify(exportData, null, 2), "utf-8");

          exportedCount++;
          exportedTemplates.push({
            templateName: template.name,
            filename,
            categoriesCount: exportData.categories.length,
            ingredientsCount: exportData.categories.reduce(
              (sum, cat) => sum + cat.ingredients.length,
              0
            ),
          });

          console.log(`✅ Exported: ${filename}`);
          console.log(`   - Categories: ${exportData.categories.length}`);
          console.log(
            `   - Ingredients: ${exportData.categories.reduce(
              (sum, cat) => sum + cat.ingredients.length,
              0
            )}`,
          );
        } catch (error) {
          errorCount++;
          console.error(`❌ Error exporting template "${template.name}":`, error);
        }
      }

      console.log("\n" + "=".repeat(50));
      console.log("📊 EXPORT SUMMARY");
      console.log("=".repeat(50));
      console.log(`   - Total templates found: ${templates.length}`);
      console.log(`   - Successfully exported: ${exportedCount}`);
      console.log(`   - Errors: ${errorCount}`);
      console.log("=".repeat(50));

      return {
        result: "Template export completed",
        exportedCount,
        errorCount,
        exportedTemplates,
      };
    } catch (error) {
      console.error("❌ Template export failed:", error);
      throw error;
    }
  },
});
