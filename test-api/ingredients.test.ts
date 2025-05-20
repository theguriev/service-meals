let ingredientId: string;
let testCategoryId: string; // Will be created during tests

describe.sequential("Ingredients API", () => {
  // Setup: Create a category to be used for ingredient tests
  beforeAll(async () => {
    // First, ensure a meal exists to associate the category with
    // For simplicity, we assume a meal might exist or create one if necessary.
    // Here, we'll use a placeholder mealId, assuming it's managed elsewhere or not strictly needed for category creation in this context.
    const mealIdForCategory = "mealForCategory123";
    const newCategory = { name: "Test Category for Ingredients" };
    await $fetch(`/categories/${mealIdForCategory}`, {
      baseURL: process.env.API_URL,
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
      },
      body: newCategory,
      onResponse: ({ response }) => {
        expect(response.status).toBe(200);
        testCategoryId = response._data.data._id; // Save created categoryId
      },
    });
  });

  describe("POST /ingredients/{categoryId}", () => {
    it("should create a new ingredient for a category", async () => {
      const newIngredient = {
        name: "Chicken Breast",
        calories: 165,
        proteins: 31,
        grams: 100,
      };
      await $fetch(`/ingredients/${testCategoryId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: newIngredient,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item added successfully");
          expect(response._data.data).toMatchObject(newIngredient);
          expect(response._data.data.categoryId).toBe(testCategoryId);
          ingredientId = response._data.data._id; // Save ingredientId for later tests
        },
      });
    });

    it("should return a validation error if required fields are missing", async () => {
      await $fetch(`/ingredients/${testCategoryId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { name: "Missing Fields Test" }, // Missing calories, proteins, grams
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 404 if category does not exist or does not belong to user", async () => {
      const nonExistentCategoryId = "605c72ef29592b001c000000"; // Example non-existent ID
      const newIngredient = {
        name: "Test Ingredient",
        calories: 100,
        proteins: 10,
        grams: 50,
      };
      await $fetch(`/ingredients/${nonExistentCategoryId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: newIngredient,
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
          expect(response._data.message).toBe(
            "Category not found or access denied"
          );
        },
      });
    });
  });

  describe("GET /ingredients/{categoryId}", () => {
    it("should retrieve a list of ingredients for a specific category", async () => {
      // Create an ingredient first to ensure there's data
      await $fetch(`/ingredients/${testCategoryId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: {
          name: "Ingredient for GET test",
          calories: 50,
          proteins: 5,
          grams: 20,
        },
      });

      await $fetch(`/ingredients/${testCategoryId}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          const ingredientForCategory = response._data.find(
            (ing) => ing.categoryId === testCategoryId
          );
          expect(ingredientForCategory).toBeDefined();
        },
      });
    });

    it("should retrieve ingredients with pagination", async () => {
      const limit = 1;
      const offset = 0;
      // Create a few ingredients for pagination testing
      for (let i = 0; i < 2; i++) {
        await $fetch(`/ingredients/${testCategoryId}`, {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
          },
          body: {
            name: `Paginated Ingredient ${i + 1}`,
            calories: 10 * i,
            proteins: i,
            grams: 5 * i,
          },
        });
      }

      await $fetch(
        `/ingredients/${testCategoryId}?offset=${offset}&limit=${limit}`,
        {
          baseURL: process.env.API_URL,
          method: "GET",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
          },
          onResponse: ({ response }) => {
            expect(response.status).toBe(200);
            expect(Array.isArray(response._data)).toBe(true);
            expect(response._data.length).toBeLessThanOrEqual(limit);
          },
        }
      );
    });
  });

  describe("GET /ingredients (general listing)", () => {
    it("should retrieve a list of all ingredients for the user (paginated)", async () => {
      await $fetch("/ingredients", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        query: { limit: 5, offset: 0 },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });
  });

  describe("PUT /ingredients/{categoryId}/{id}", () => {
    it("should update an existing ingredient", async () => {
      const updatedIngredientData = {
        name: "Grilled Chicken Breast",
        calories: 170,
      };
      await $fetch(`/ingredients/${testCategoryId}/${ingredientId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: updatedIngredientData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.name).toBe(updatedIngredientData.name);
          expect(response._data.calories).toBe(updatedIngredientData.calories);
        },
      });
    });

    it("should return 404 if trying to update a non-existent ingredient", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/ingredients/${testCategoryId}/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { name: "Update Non Existent" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });
  });

  describe("DELETE /ingredients/{categoryId}/{id}", () => {
    it("should delete an existing ingredient", async () => {
      // Create a new ingredient specifically for this delete test to avoid conflicts
      const ingredientToDelete = {
        name: "Ingredient to Delete",
        calories: 10,
        proteins: 1,
        grams: 1,
      };
      let tempIngredientId: string;
      await $fetch(`/ingredients/${testCategoryId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: ingredientToDelete,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          tempIngredientId = response._data.data._id;
        },
      });

      await $fetch(`/ingredients/${testCategoryId}/${tempIngredientId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item deleted successfully");
        },
      });
    });

    it("should return 404 if trying to delete a non-existent ingredient", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/ingredients/${testCategoryId}/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });
  });

  // Cleanup: Delete the category created for tests
  afterAll(async () => {
    if (testCategoryId) {
      // Assuming a mealId is required for category deletion, similar to creation.
      // This might need adjustment based on your actual API for deleting categories.
      const mealIdForCategoryDeletion = "mealForCategory123"; // Same as used in beforeAll
      await $fetch(
        `/categories/${mealIdForCategoryDeletion}/${testCategoryId}`,
        {
          baseURL: process.env.API_URL,
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
          },
          ignoreResponseError: true, // Ignore if already deleted or non-existent
        }
      );
    }
  });
});
