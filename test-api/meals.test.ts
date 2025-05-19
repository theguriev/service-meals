let id;

describe("Meals API", () => {
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
          id = response._data._id;
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
});
