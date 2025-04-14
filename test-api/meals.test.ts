const baseURL = "http://localhost:4000";

const mealBody = {
  timestamp: Date.now(),
  type: "temperature",
  meta: {
    unit: "Celsius",
    location: "office",
  },
};

let mealId = undefined;

describe.sequential("meal", () => {
  const validAccessToken = issueAccessToken(
    { userId: 123 },
    { secret: process.env.SECRET }
  );

  describe("POST /meal", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch("/meal", {
        baseURL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: {},
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("gets 200 on valid meal data", async () => {
      await $fetch("/meal", {
        baseURL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: mealBody,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.meal).toMatchObject(mealBody);
          mealId = response._data.meal._id;
        },
      });
    });
  });

  describe("GET /meal", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch("/meal", {
        baseURL,
        method: "GET",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        query: { type: "" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("gets 200 on valid query parameters", async () => {
      await $fetch("/meal", {
        baseURL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        query: {
          type: "temperature",
          sort: "asc",
          offset: 0,
          limit: 10,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data).toHaveProperty("meals");
          expect(Array.isArray(response._data.meals)).toBe(true);
        },
      });
    });
  });

  describe("PUT /meal/:id", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch(`/meal/${mealId}`, {
        baseURL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: {},
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("gets 200 on valid update data", async () => {
      await $fetch(`/meal/${mealId}`, {
        baseURL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: {
          type: "humidity",
          meta: {
            unit: "Percentage",
            location: "office",
          },
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data).toHaveProperty("meal");
          expect(response._data.meal.type).toBe("humidity");
          expect(response._data.meal.meta.unit).toBe("Percentage");
        },
      });
    });

    it("gets 404 if meal not found or not authorized", async () => {
      await $fetch(`/meal/invalidmealId`, {
        baseURL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: {
          type: "humidity",
          meta: {
            unit: "Percentage",
            location: "office",
          },
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });
  });
});
