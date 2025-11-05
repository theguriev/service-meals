import { writeFile } from "fs/promises";
import { join } from "path";
import { defaultTemplateName } from "~~/constants";

interface MigrationHelperOptions {
  templateName: string;
  migrationName?: string;
  description?: string;
}

export default defineTask({
  meta: {
    name: "migrations:create",
    description: "Create a new migration file for a template",
  },
  run: async ({ payload, context }) => {
    try {
      const options = payload as unknown as MigrationHelperOptions;

      // Генерируем имя миграции из имени шаблона если не указано
      const migrationName =
        options.migrationName ||
        options.templateName?.toLowerCase()
          .replace(/[^a-zа-я0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      const templateName = migrationName === "default" ? defaultTemplateName : options.templateName;

      if (!templateName) {
        throw new Error("Template name is required in payload");
      }

      console.log(
        `🚀 Creating migration for template: ${templateName}`
      );

      const description =
        options.description || `Migration for ${templateName} template`;

      // Получаем текущую дату для timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);
      const filename = `${timestamp}-${migrationName}.ts`;

      // Создаем содержимое миграции
      const migrationContent = `import { readFile } from 'fs/promises';
import { join } from 'path';

interface TemplateIngredient {
  name: string;
  calories: number;
  proteins: number;
  grams: number;
  unit?: "grams" | "pieces";
}

interface TemplateCategory {
  name: string;
  description?: string;
  targetCalories?: number;
  ingredients: TemplateIngredient[];
}

interface TemplateData {
  name: string;
  description?: string;
  categories: TemplateCategory[];
}

export default defineTask({
  meta: {
    name: "db:migrate-${migrationName}",
    description: "${description}",
  },
  run: async ({ payload, context }) => {
    try {
      console.log("🚀 Starting migration: ${templateName}");

      // Проверяем, существует ли шаблон с таким именем
      const existingTemplate = await ModelTemplate.findOne({ name: "${templateName}" });
      if (existingTemplate) {
        console.log(\`⏭️  Template "\${existingTemplate.name}" already exists, skipping...\`);
        return {
          result: {
            templateId: existingTemplate._id,
            templateName: existingTemplate.name,
            skipped: true
          }
        };
      }

      // Читаем JSON файл с данными шаблона
      const filePath = join(process.cwd(), 'data', 'templates', '${migrationName}.json');
      const fileContent = await readFile(filePath, 'utf-8');
      const templateData: TemplateData = JSON.parse(fileContent);

      console.log(\`📋 Template: \${templateData.name}\`);
      if (templateData.description) {
        console.log(\`💭 Description: \${templateData.description}\`);
      }

      // 1. Создаем основной template
      const template = new ModelTemplate({
        name: templateData.name,
        description: templateData.description,
      });
      const savedTemplate = await template.save();
      console.log(\`✅ Created template: \${savedTemplate.name} (\${savedTemplate._id})\`);

      // 2. Создаем categories и ingredients
      let totalCategories = 0;
      let totalIngredients = 0;

      // Создаем categories
      for (const categoryData of templateData.categories) {
        const category = new ModelCategories({
          name: categoryData.name,
          description: categoryData.description,
          targetCalories: categoryData.targetCalories,
          templateId: savedTemplate._id,
        });
        const savedCategory = await category.save();
        totalCategories++;
        console.log(\`    ✅ Created category: \${savedCategory.name} (\${savedCategory._id}) - \${categoryData.description || 'No description'}\`);

        // Создаем ingredients для category
        for (const ingredientData of categoryData.ingredients) {
          const ingredient = new ModelIngredients({
            categoryId: savedCategory._id,
            name: ingredientData.name,
            calories: ingredientData.calories,
            proteins: ingredientData.proteins,
            grams: ingredientData.grams ?? 0,
            unit: ingredientData.unit ?? "grams",
          });
          await ingredient.save();
          totalIngredients++;
        }

        console.log(\`      🥗 Created \${categoryData.ingredients.length} ingredients for category "\${categoryData.name}"\`);
      }

      console.log(\`\`);
      console.log(\`✅ Migration completed successfully!\`);
      console.log(\`📊 Statistics:\`);
      console.log(\`   📂 Categories created: \${totalCategories}\`);
      console.log(\`   🥗 Ingredients created: \${totalIngredients}\`);

      return {
        result: {
          templateId: savedTemplate._id,
          templateName: savedTemplate.name,
          categoriesCreated: totalCategories,
          ingredientsCreated: totalIngredients,
          created: true
        }
      };
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }
});`;

      // Сохраняем файл миграции
      const migrationPath = join(
        process.cwd(),
        "server",
        "tasks",
        "migrations",
        filename
      );
      await writeFile(migrationPath, migrationContent, "utf-8");

      console.log(`✅ Migration created: ${filename}`);
      console.log(`📁 File saved to: server/tasks/migrations/${filename}`);
      console.log(`\n💡 Next steps:`);
      console.log(
        `   1. Make sure you have data/templates/${migrationName}.json with template data`
      );
      console.log(
        `   2. Run the migration: npx nitro-task db:migrate-${migrationName}`
      );

      return {
        result: {
          filename,
          migrationPath,
          migrationName,
          templateName,
          taskName: `db:migrate-${migrationName}`,
        },
      };
    } catch (error) {
      console.error("❌ Migration creation failed:", error);
      throw error;
    }
  },
});
