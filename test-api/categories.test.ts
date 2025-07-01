let categoryId;
let testMealId = "685950e525652632670bc78c"; // Static mealId for testing purposes

describe.sequential("Categories API", () => {
  describe("POST /categories/{mealId}", () => {
    it("should create a new category for a meal", async () => {
      const newCategory = { name: "Category A" };
      await $fetch(`/categories/${testMealId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: newCategory,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item added successfully");
          expect(response._data.data).toMatchObject(newCategory);
          expect(response._data.data.mealId).toBe(testMealId);
          categoryId = response._data.data._id; // Save categoryId for later tests
        },
      });
    });

    it("should return a validation error if name is missing", async () => {
      await $fetch(`/categories/${testMealId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: {},
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });
  });

  describe("GET /categories/{mealId}", () => {
    it("should retrieve a list of categories for a specific meal", async () => {
      // Create a category first to ensure there's data for the mealId
      await $fetch(`/categories/${testMealId}`, {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { name: "Category for GET test" },
      });

      await $fetch(`/categories/${testMealId}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          // Check if at least one category returned has the correct mealId
          const categoryForMeal = response._data.find(
            (cat) => cat.mealId === testMealId
          );
          expect(categoryForMeal).toBeDefined();
          // Check for ingredients array
          expect(categoryForMeal).toHaveProperty("ingredients");
          expect(Array.isArray(categoryForMeal.ingredients)).toBe(true);
        },
      });
    });

    it("should retrieve categories with pagination (offset and limit)", async () => {
      const limit = 2;
      const offset = 1;
      // Create a few categories for pagination testing under testMealId
      for (let i = 0; i < 5; i++) {
        await $fetch(`/categories/${testMealId}`, {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          body: { name: `Paginated Category ${i + 1} for ${testMealId}` },
        });
      }

      await $fetch(
        `/categories/${testMealId}?offset=${offset}&limit=${limit}`,
        {
          baseURL: process.env.API_URL,
          method: "GET",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          onResponse: ({ response }) => {
            expect(response.status).toBe(200);
            expect(Array.isArray(response._data)).toBe(true);
            expect(response._data.length).toBeLessThanOrEqual(limit);
            // Check for ingredients array in paginated results
            if (response._data.length > 0) {
              const firstCategory = response._data[0];
              expect(firstCategory).toHaveProperty("ingredients");
              expect(Array.isArray(firstCategory.ingredients)).toBe(true);
            }
          },
        }
      );
    });
  });

  describe("GET /categories (general listing, if applicable)", () => {
    it("should retrieve a list of all categories (paginated)", async () => {
      await $fetch("/categories", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        query: { limit: 5, offset: 0 },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });
  });

  describe("PUT /categories/{mealId}/{id}", () => {
    it("should update an existing category", async () => {
      const updatedCategoryData = { name: "Updated Category Name" };
      await $fetch(`/categories/${testMealId}/${categoryId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedCategoryData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item updated successfully");
          expect(response._data.ingredient.name).toBe(updatedCategoryData.name);
        },
      });
    });

    it("should return 404 if trying to update a non-existent category", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/categories/${testMealId}/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { name: "Update Non Existent" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
          expect(response._data.message).toBe("Item not found");
        },
      });
    });

    it("should return 400 if category ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/categories/${testMealId}/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { name: "Update Invalid Id" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid item ID");
        },
      });
    });
  });

  describe("DELETE /categories/{mealId}/{id}", () => {
    it("should delete an existing category", async () => {
      await $fetch(`/categories/${testMealId}/${categoryId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item deleted successfully");
        },
      });
    });

    it("should return 404 if trying to delete a non-existent category", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/categories/${testMealId}/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
          expect(response._data.message).toBe("Item not found");
        },
      });
    });

    it("should return 400 if category ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/categories/${testMealId}/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid item ID");
        },
      });
    });
  });
});
