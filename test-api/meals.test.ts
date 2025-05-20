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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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

    it("should return a validation error if name is missing", async () => {
      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { name: "Meal 1" },
      });

      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { name: "Meal 2" },
      });

      await $fetch("/meals", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
            Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBeLessThanOrEqual(10);
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item deleted successfully");
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
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
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid item ID");
        },
      });
    });
  });
});
