import { writeFile } from "fs/promises";
import { join } from "path";

interface TemplateGeneratorOptions {
  name: string;
  description?: string;
  mealsCount?: number;
  categoriesPerMeal?: string[];
  withExampleIngredients?: boolean;
}

export default defineTask({
  meta: {
    name: "templates:generate",
    description: "Generate a new template JSON file with example structure",
  },
  run: async ({ payload, context }) => {
    try {
      const options = payload as unknown as TemplateGeneratorOptions;

      if (!options.name) {
        throw new Error("Template name is required in payload");
      }

      console.log(`🚀 Generating template: ${options.name}`);

      // Устанавливаем defaults
      const mealsCount = options.mealsCount || 5;
      const categoriesPerMeal = options.categoriesPerMeal || [
        "а",
        "б",
        "в",
        "г",
        "д",
      ];
      const withExampleIngredients = options.withExampleIngredients !== false;

      // Создаем структуру шаблона
      const template = {
        name: options.name,
        description:
          options.description || `Шаблон харчування: ${options.name}`,
        meals: [] as any[],
      };

      // Генерируем meals
      for (let i = 1; i <= mealsCount; i++) {
        const meal = {
          name: `${i}️⃣ прийом їжі`,
          categories: [] as any[],
        };

        // Генерируем категории для каждого meal
        for (const categoryLetter of categoriesPerMeal) {
          const category = {
            name: categoryLetter,
            description: getCategoryDescription(categoryLetter),
            targetCalories: getCategoryTargetCalories(categoryLetter),
            ingredients: [] as any[],
          };

          // Добавляем примеры ингредиентов если нужно
          if (withExampleIngredients) {
            category.ingredients = getExampleIngredients(categoryLetter);
          }

          meal.categories.push(category);
        }

        template.meals.push(meal);
      }

      // Создаем filename из имени шаблона
      const filename =
        options.name
          .toLowerCase()
          .replace(/[^a-zа-я0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") + ".json";

      // Сохраняем файл
      const filePath = join(process.cwd(), "data", "templates", filename);
      await writeFile(filePath, JSON.stringify(template, null, 2), "utf-8");

      console.log(`✅ Template generated: ${filename}`);
      console.log(`📁 File saved to: data/templates/${filename}`);
      console.log(
        `🍽️  Generated ${mealsCount} meals with ${categoriesPerMeal.length} categories each`
      );

      if (withExampleIngredients) {
        const totalIngredients = template.meals.reduce(
          (total, meal) =>
            total +
            meal.categories.reduce(
              (catTotal: number, cat: any) => catTotal + cat.ingredients.length,
              0
            ),
          0
        );
        console.log(`🥗 Added ${totalIngredients} example ingredients`);
      }

      console.log(`\n💡 Next steps:`);
      console.log(
        `   1. Edit data/templates/${filename} to customize your template`
      );
      console.log(`   2. Run: pnpm migrate to import the template`);

      return {
        result: {
          filename,
          filePath,
          mealsCount,
          categoriesCount: categoriesPerMeal.length,
          totalIngredients: withExampleIngredients
            ? template.meals.reduce(
                (total, meal) =>
                  total +
                  meal.categories.reduce(
                    (catTotal: number, cat: any) =>
                      catTotal + cat.ingredients.length,
                    0
                  ),
                0
              )
            : 0,
        },
      };
    } catch (error) {
      console.error("❌ Template generation failed:", error);
      throw error;
    }
  },
});

function getCategoryDescription(letter: string): string {
  const descriptions: Record<string, string> = {
    а: "Вуглеводи",
    б: "Молочні продукти",
    в: "Вільний вибір",
    г: "М'ясо та риба",
    д: "Овочі",
    е: "Фрукти",
    є: "Жири",
    ж: "Горіхи та насіння",
    з: "Злаки",
    и: "Яйця",
    і: "Бобові",
    ї: "Морепродукти",
    й: "Додатки",
  };
  return descriptions[letter] || `Категорія ${letter}`;
}

function getCategoryTargetCalories(letter: string): number {
  const calories: Record<string, number> = {
    а: 110,
    б: 65,
    в: 450,
    г: 120,
    д: 25,
    е: 60,
    є: 45,
    ж: 165,
    з: 110,
    и: 75,
    і: 110,
    ї: 120,
    й: 20,
  };
  return calories[letter] || 100;
}

function getExampleIngredients(letter: string): any[] {
  const ingredients: Record<string, any[]> = {
    а: [
      { name: "Бобові", calories: 110, proteins: 8, grams: 30 },
      { name: "Картопля", calories: 110, proteins: 2, grams: 100 },
      { name: "Рис (не шліфований)", calories: 110, proteins: 3, grams: 30 },
    ],
    б: [
      { name: "Кефір 1%", calories: 65, proteins: 4, grams: 135 },
      { name: "Йогурт натуральний", calories: 65, proteins: 4, grams: 125 },
      {
        name: "Сир кисломолочний нежирний",
        calories: 65,
        proteins: 12,
        grams: 70,
      },
    ],
    в: [
      {
        name: "Будь-що (солодощі, снеки тощо)",
        calories: 450,
        proteins: 5,
        grams: 90,
      },
    ],
    г: [
      { name: "Курка без шкіри", calories: 120, proteins: 25, grams: 60 },
      { name: "Риба нежирна", calories: 120, proteins: 24, grams: 70 },
      { name: "Яловичина нежирна", calories: 120, proteins: 22, grams: 55 },
    ],
    д: [
      { name: "Капуста", calories: 25, proteins: 2, grams: 100 },
      { name: "Помідори", calories: 25, proteins: 1, grams: 140 },
      { name: "Огірки", calories: 25, proteins: 1, grams: 200 },
    ],
  };

  return (
    ingredients[letter] || [
      {
        name: `Приклад інгредієнта ${letter}`,
        calories: 100,
        proteins: 5,
        grams: 50,
      },
    ]
  );
}
