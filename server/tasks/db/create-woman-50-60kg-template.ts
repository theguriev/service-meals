export default defineTask({
  meta: {
    name: "db:create-woman-50-60kg-template",
    description: "Run woman 50-60kg template migration",
  },
  run: async ({ payload, context }) => {
    try {
      console.log("🚀 Starting migration: Woman 50-60kg Template");

      // 1. Создаем основной template
      const template = new ModelTemplate({
        name: "50-60 кг жінки",
      });
      const savedTemplate = await template.save();
      console.log(
        `✅ Created template: ${savedTemplate.name} (${savedTemplate._id})`
      );

      // 2. Создаем meals для каждого приема пищи
      const mealsData = [
        {
          name: "1️⃣ прийом їжі",
          categories: [
            {
              name: "а",
              ingredients: [
                { name: "Бобові", calories: 110, proteins: 8, grams: 30 },
                { name: "Картопля", calories: 110, proteins: 2, grams: 100 },
                {
                  name: "Кукурудза свіжа",
                  calories: 110,
                  proteins: 3,
                  grams: 100,
                },
                {
                  name: "Рис (не шліфований)",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                {
                  name: "Будь-яка крупа",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                {
                  name: "Цільнозернове борошно",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                { name: "Хлібці", calories: 110, proteins: 3, grams: 45 },
                {
                  name: "Цільнозерновий хліб",
                  calories: 110,
                  proteins: 3,
                  grams: 50,
                },
                {
                  name: "Макарони т.с.",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                { name: "Лаваш", calories: 110, proteins: 3, grams: 45 },
              ],
            },
            {
              name: "б",
              ingredients: [
                {
                  name: "Сир кисломолочний нежирний (0,2% жиру)",
                  calories: 65,
                  proteins: 12,
                  grams: 70,
                },
                {
                  name: "Сири м'які, тверді, плавлені",
                  calories: 65,
                  proteins: 4,
                  grams: 17,
                },
                { name: "Сметана 15%", calories: 65, proteins: 1, grams: 30 },
                { name: "Кефір 1%", calories: 65, proteins: 4, grams: 135 },
                {
                  name: "Несолодкий йогурт 1% жиру",
                  calories: 65,
                  proteins: 4,
                  grams: 125,
                },
                { name: "Молоко 1%", calories: 65, proteins: 4, grams: 140 },
              ],
            },
            {
              name: "в",
              ingredients: [
                {
                  name: "Будь-що (солодощі, снеки, ковбаса тощо)",
                  calories: 450,
                  proteins: 5,
                  grams: 90,
                },
              ],
            },
          ],
        },
        {
          name: "2️⃣ прийом їжі",
          categories: [
            {
              name: "г",
              ingredients: [
                { name: "Бобові", calories: 110, proteins: 8, grams: 30 },
                { name: "Картопля", calories: 110, proteins: 2, grams: 100 },
                {
                  name: "Кукурудза свіжа",
                  calories: 110,
                  proteins: 3,
                  grams: 100,
                },
                {
                  name: "Рис (не шліфований)",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                {
                  name: "Будь-яка крупа",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                {
                  name: "Цільнозернове борошно",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                { name: "Хлібці", calories: 110, proteins: 3, grams: 45 },
                {
                  name: "Цільнозерновий хліб",
                  calories: 110,
                  proteins: 3,
                  grams: 50,
                },
                {
                  name: "Макарони т.с.",
                  calories: 110,
                  proteins: 3,
                  grams: 30,
                },
                { name: "Лаваш", calories: 110, proteins: 3, grams: 45 },
              ],
            },
            {
              name: "д",
              ingredients: [
                { name: "Телятина", calories: 105, proteins: 20, grams: 80 },
                { name: "Печінка", calories: 105, proteins: 18, grams: 80 },
                {
                  name: "Куряче або індиче філе",
                  calories: 105,
                  proteins: 23,
                  grams: 100,
                },
                {
                  name: "Риба (до 5% жиру)",
                  calories: 105,
                  proteins: 20,
                  grams: 120,
                },
                {
                  name: "Риба (від 5% жиру)",
                  calories: 105,
                  proteins: 18,
                  grams: 80,
                },
                { name: "2 яйця", calories: 105, proteins: 12, grams: 100 },
                {
                  name: "Морепродукти",
                  calories: 105,
                  proteins: 20,
                  grams: 125,
                },
              ],
            },
            {
              name: "е",
              ingredients: [
                {
                  name: "Овочі (квашені також і зелень)",
                  calories: 60,
                  proteins: 2,
                  grams: 300,
                },
                { name: "Гриби", calories: 60, proteins: 3, grams: 300 },
              ],
            },
            {
              name: "є",
              ingredients: [
                {
                  name: "Будь-яка олія (рекомендуємо лляну)",
                  calories: 65,
                  proteins: 0,
                  grams: 7,
                },
                { name: "Майонез", calories: 65, proteins: 0, grams: 9 },
                { name: "Авокадо", calories: 65, proteins: 1, grams: 40 },
                { name: "Оливки", calories: 65, proteins: 1, grams: 55 },
                { name: "Гірчиця", calories: 65, proteins: 3, grams: 20 },
                { name: "Кетчуп", calories: 65, proteins: 1, grams: 30 },
                { name: "Масло", calories: 65, proteins: 0, grams: 8 },
                { name: "Сало", calories: 65, proteins: 1, grams: 10 },
              ],
            },
          ],
        },
        {
          name: "3️⃣ прийом їжі",
          categories: [
            {
              name: "ж",
              ingredients: [
                {
                  name: "Сир кисломолочний нежирний (0,2% жиру)",
                  calories: 100,
                  proteins: 18,
                  grams: 115,
                },
                {
                  name: "Сири м'які, тверді, плавлені",
                  calories: 100,
                  proteins: 6,
                  grams: 25,
                },
                { name: "Сметана 15%", calories: 100, proteins: 2, grams: 55 },
                { name: "Кефір 1%", calories: 100, proteins: 7, grams: 215 },
                {
                  name: "Несолодкий йогурт 1% жиру",
                  calories: 100,
                  proteins: 7,
                  grams: 205,
                },
                { name: "Молоко 1%", calories: 100, proteins: 7, grams: 220 },
              ],
            },
            {
              name: "з",
              ingredients: [
                {
                  name: "Фрукти та ягоди",
                  calories: 150,
                  proteins: 1,
                  grams: 230,
                },
                {
                  name: "Банани, виноград, хурма",
                  calories: 150,
                  proteins: 2,
                  grams: 140,
                },
              ],
            },
            {
              name: "и",
              ingredients: [
                {
                  name: "Будь-які горіхи (рекомендуємо грецькі)",
                  calories: 55,
                  proteins: 2,
                  grams: 8,
                },
                { name: "Насіння", calories: 55, proteins: 2, grams: 8 },
              ],
            },
          ],
        },
        {
          name: "4️⃣ прийом їжі",
          categories: [
            {
              name: "і",
              ingredients: [
                { name: "Телятина", calories: 105, proteins: 20, grams: 80 },
                { name: "Печінка", calories: 105, proteins: 18, grams: 80 },
                {
                  name: "Куряче або індиче філе",
                  calories: 105,
                  proteins: 23,
                  grams: 100,
                },
                {
                  name: "Риба (до 5% жиру)",
                  calories: 105,
                  proteins: 20,
                  grams: 120,
                },
                {
                  name: "Риба (від 5% жиру)",
                  calories: 105,
                  proteins: 18,
                  grams: 80,
                },
                { name: "2 яйця", calories: 105, proteins: 12, grams: 100 },
                {
                  name: "Морепродукти",
                  calories: 105,
                  proteins: 20,
                  grams: 125,
                },
              ],
            },
            {
              name: "ї",
              ingredients: [
                {
                  name: "Овочі (квашені також і зелень)",
                  calories: 60,
                  proteins: 2,
                  grams: 300,
                },
                { name: "Гриби", calories: 60, proteins: 3, grams: 300 },
              ],
            },
            {
              name: "й",
              ingredients: [
                {
                  name: "Будь-яка олія (рекомендуємо лляну)",
                  calories: 65,
                  proteins: 0,
                  grams: 7,
                },
                { name: "Майонез", calories: 65, proteins: 0, grams: 9 },
                { name: "Авокадо", calories: 65, proteins: 1, grams: 40 },
                { name: "Оливки", calories: 65, proteins: 1, grams: 55 },
                { name: "Гірчиця", calories: 65, proteins: 3, grams: 20 },
                { name: "Кетчуп", calories: 65, proteins: 1, grams: 30 },
                { name: "Масло", calories: 65, proteins: 0, grams: 8 },
                { name: "Сало", calories: 65, proteins: 1, grams: 10 },
              ],
            },
          ],
        },
      ];

      // 3. Создаем meals, categories и ingredients
      let totalMeals = 0;
      let totalCategories = 0;
      let totalIngredients = 0;

      for (const mealData of mealsData) {
        // Создаем meal
        const meal = new ModelMeals({
          templateId: savedTemplate._id,
          name: mealData.name,
          userId: "templates",
        });
        const savedMeal = await meal.save();
        totalMeals++;
        console.log(`  ✅ Created meal: ${savedMeal.name} (${savedMeal._id})`);

        // Создаем categories для meal
        for (const categoryData of mealData.categories) {
          const category = new ModelCategories({
            mealId: savedMeal._id,
            name: categoryData.name,
            userId: "templates",
          });
          const savedCategory = await category.save();
          totalCategories++;
          console.log(
            `    ✅ Created category: ${savedCategory.name} (${savedCategory._id})`
          );

          // Создаем ingredients для category
          for (const ingredientData of categoryData.ingredients) {
            const ingredient = new ModelIngredients({
              categoryId: savedCategory._id,
              name: ingredientData.name,
              calories: ingredientData.calories,
              proteins: ingredientData.proteins,
              grams: ingredientData.grams,
              userId: "templates",
            });
            const savedIngredient = await ingredient.save();
            totalIngredients++;
            console.log(
              `      ✅ Created ingredient: ${savedIngredient.name} (${savedIngredient._id})`
            );
          }
        }
      }

      console.log("🎉 Migration completed successfully!");
      console.log(`📊 Template stats:`);
      console.log(`   - Template: ${savedTemplate.name}`);
      console.log(`   - Total meals: ${totalMeals}`);
      console.log(`   - Total categories: ${totalCategories}`);
      console.log(`   - Total ingredients: ${totalIngredients}`);

      return {
        result: "Migration completed successfully!",
        templateId: savedTemplate._id,
        templateName: savedTemplate.name,
        stats: {
          meals: totalMeals,
          categories: totalCategories,
          ingredients: totalIngredients,
        },
      };
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  },
});
