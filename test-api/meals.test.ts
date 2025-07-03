let id;

describe.sequential("Meals API", () => {
  describe("POST /meals", () => {
    it("should create a new meal", async () => {
      const newMeal = { name: "Test Meal" };
      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: newMeal,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item added successfully");
          expect(response._data.data).toMatchObject(newMeal);
          id = response._data.data._id;
        },
      });
    });

    it("should create a new meal with template ID", async () => {
      const newMeal = {
        name: "Test Meal",
        templateId: "605c72ef29592b001c000001",
      };
      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: newMeal,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item added successfully");
          expect(response._data.data).toMatchObject(newMeal);
        },
      });
    });

    it("should return a validation error if name is missing", async () => {
      await $fetch("/meals", {
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

  describe("GET /meals", () => {
    it("should retrieve a list of meals", async () => {
      // Optionally, create some meals first to ensure there's data
      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { name: "Meal 1" },
      });

      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { name: "Meal 2" },
      });

      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });

    it("should retrieve meals with pagination (offset and limit)", async () => {
      // Create a few meals for pagination testing
      for (let i = 0; i < 15; i++) {
        await $fetch("/meals", {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          body: { name: `[loop] Meal ${i}` },
        });
      }

      const limit = 5;
      const offset = 5;

      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        query: { offset, limit },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBe(limit);
        },
      });
    });

    it("should use default pagination if not provided", async () => {
      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBeLessThanOrEqual(10);
        },
      });
    });
  });

  describe("GET /meals/:id", () => {
    it("should retrieve a specific meal with categories and ingredients", async () => {
      // Assume 'id' is available from a previously created meal or create one
      // For example, using the 'id' from the POST /meals test
      if (!id) {
        // Create a meal to ensure 'id' is defined
        const newMeal = { name: "Test Meal for GET by ID" };
        await $fetch("/meals", {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          body: newMeal,
          onResponse: ({ response }) => {
            id = response._data.data._id;
          },
        });
      }
      let testCategoryId;
      for (let i = 0; i < 5; i++) {
        await $fetch(`/categories/${id}`, {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          body: { name: `Paginated Category ${i + 1} for ${id}` },
          onResponse: ({ response }) => {
            testCategoryId = response._data.data._id;
          },
        });
        for (let j = 0; j < 2; j++) {
          await $fetch(`/ingredients/${testCategoryId}`, {
            baseURL: process.env.API_URL,
            method: "POST",
            headers: {
              Accept: "application/json",
              Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
            },
            body: {
              name: `Paginated Ingredient ${j + 1}`,
              calories: 10 * j,
              proteins: j,
              grams: 5 * j,
            },
          });
        }
      }

      await $fetch(`/meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "GET" as any, // Add type assertion here
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data).toHaveProperty("_id", id);
          expect(response._data).toHaveProperty("name");
          expect(response._data).toHaveProperty("categories");
          expect(Array.isArray(response._data.categories)).toBe(true);
          // Further checks can be added if categories and ingredients are seeded
          if (response._data.categories.length > 0) {
            const category = response._data.categories[0];
            expect(category).toHaveProperty("name");
            expect(category).toHaveProperty("ingredients");
            expect(Array.isArray(category.ingredients)).toBe(true);
          }
        },
      });
    });

    it("should return 404 if meal is not found", async () => {
      const nonExistentId = "605c72ef29592b001c000000"; // Example of a valid but non-existent ObjectId
      await $fetch(`/meals/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "GET" as any, // Add type assertion here
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
          expect(response._data.statusMessage).toBe("Meal not found");
        },
      });
    });

    it("should return 400 if meal ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/meals/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "GET" as any, // Add type assertion here
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

  describe("PUT /meals/:id", () => {
    it("should update an existing meal", async () => {
      const updatedMealData = { name: "Updated Meal Name" };
      await $fetch(`/meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item updated successfully");
          expect(response._data.ingredient.name).toBe(updatedMealData.name);
        },
      });
    });

    it("should return 404 if trying to update a non-existent meal", async () => {
      const nonExistentId = "605c72ef29592b001c000000"; // Example of a valid but non-existent ObjectId
      const updatedMealData = { name: "Update Non Existent" };
      await $fetch(`/meals/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
          expect(response._data.message).toBe("Item not found");
        },
      });
    });

    it("should return 400 if meal ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      const updatedMealData = { name: "Update Invalid Id" };
      await $fetch(`/meals/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid item ID");
        },
      });
    });

    it("should return a validation error if name is missing in update", async () => {
      const updatedMealData = { name: "" }; // Empty name
      await $fetch(`/meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          // Add specific error message check if your API returns one for this case
        },
      });
    });
  });

  describe("DELETE /meals/:id", () => {
    it("should delete an existing meal", async () => {
      await $fetch(`/meals/${id}`, {
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
      await $fetch(`/categories/${id}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBe(0);
        },
      });
    });

    it("should return 404 if trying to delete a non-existent meal", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/meals/${nonExistentId}`, {
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

    it("should return 400 if meal ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/meals/${invalidId}`, {
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
