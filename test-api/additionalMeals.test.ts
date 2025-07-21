export { };
let id: string | undefined;

describe.sequential("Additional meals API", () => {
  describe("POST /additional-meals", () => {
    it("should create a new additional meal", async () => {
      const newAdditionalMeal = {
        content: "Test content for additional meal",
      };
      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: newAdditionalMeal,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Additional meal added successfully");
          expect(response._data.data.content).toBe(newAdditionalMeal.content);
          id = response._data.data._id;
        },
      });
    });

    it("should return a validation error if content is missing", async () => {
      await $fetch("/additional-meals", {
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

    it("should return a validation error if content is empty", async () => {
      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { content: "" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });
  });

  describe("GET /additional-meals", () => {
    it("should retrieve a list of additional meals", async () => {
      // Create additional meal first to ensure there's data
      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: {
          content: "Test content for additional meal",
        },
      });

      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: {
          content: "Another test content for additional meal",
        },
      });

      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBeGreaterThan(0);
        },
      });
    });

    it("should retrieve additional meals with pagination (offset and limit)", async () => {
      // Create a few additional meals for pagination testing
      for (let i = 0; i < 15; i++) {
        await $fetch("/additional-meals", {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          body: {
            content: `Test content for additional meal ${i + 1}`,
          },
        });
      }

      const limit = 5;
      const offset = 5;

      await $fetch("/additional-meals", {
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
      await $fetch("/additional-meals", {
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

    it("should filter additional meals by date range", async () => {
      const startDate = new Date().toISOString();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      // Create an additional meal after startDate
      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: { content: "Test content for date range filtering" },
      });

      const endDate = new Date().toISOString();

      await $fetch("/additional-meals", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        query: { startDate, endDate },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data).toHaveLength(1);
        },
      });
    });
  });

  describe("GET /additional-meals/:id", () => {
    it("should retrieve a specific additional meal", async () => {
      // Ensure we have an id from previous tests or create one
      if (!id) {
        const newAdditionalMeal = {
          content: "Test content for additional meal",
        };
        await $fetch("/additional-meals", {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
          body: newAdditionalMeal,
          onResponse: ({ response }) => {
            id = response._data.data._id;
          },
        });
      }

      await $fetch(`/additional-meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.data).toBeDefined();
          expect(response._data.data._id).toBe(id);
        },
      });
    });

    it("should return 404 if additional meal is not found", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/additional-meals/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 400 if additional meal ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/additional-meals/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid additional meal ID");
        },
      });
    });
  });

  describe("PUT /additional-meals/:id", () => {
    it("should update an existing additional meal", async () => {
      const updatedAdditionalMealData = {
        content: "Updated content for additional meal",
      };
      await $fetch(`/additional-meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedAdditionalMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Additional meal updated successfully");
          expect(response._data.data.content).toBe(updatedAdditionalMealData.content);
        },
      });
    });

    it("should not update an existing additional meal without content", async () => {
      const updatedAdditionalMealData = { };
      await $fetch(`/additional-meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedAdditionalMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should not update an existing additional meal with empty content", async () => {
      const updatedAdditionalMealData = {
        content: "",
      };
      await $fetch(`/additional-meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedAdditionalMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 404 if trying to update a non-existent additional meal", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      const updatedAdditionalMealData = {
        content: "Updated content for non-existent additional meal",
      };
      await $fetch(`/additional-meals/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedAdditionalMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 400 if additional meal ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      const updatedAdditionalMealData = {
        content: "Updated content for invalid additional meal ID",
      };
      await $fetch(`/additional-meals/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updatedAdditionalMealData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid additional meal ID");
        },
      });
    });
  });

  describe("DELETE /additional-meals/:id", () => {
    it("should delete an existing additional meal", async () => {
      await $fetch(`/additional-meals/${id}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Additional meal deleted successfully");
        },
      });
    });

    it("should return 404 if trying to delete a non-existent additional meal", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/additional-meals/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 400 if additional meal ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/additional-meals/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid additional meal ID");
        },
      });
    });
  });
});
