let id;

describe.sequential("Sets API", () => {
  describe("POST /sets", () => {
    it("should create a new set", async () => {
      const newSet = { ids: "meal1,meal2,meal3" };
      await $fetch("/sets", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: newSet,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Set added successfully");
          expect(response._data.data).toMatchObject(newSet);
          id = response._data.data._id;
        },
      });
    });

    it("should return a validation error if ids is missing", async () => {
      await $fetch("/sets", {
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

    it("should return a validation error if ids is empty", async () => {
      await $fetch("/sets", {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { ids: "" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });
  });

  describe("GET /sets", () => {
    it("should retrieve a list of sets", async () => {
      // Create some sets first to ensure there's data
      await $fetch("/sets", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { ids: "set1-meal1,set1-meal2" },
      });

      await $fetch("/sets", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { ids: "set2-meal1,set2-meal2,set2-meal3" },
      });

      await $fetch("/sets", {
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

    it("should retrieve sets with pagination (offset and limit)", async () => {
      // Create a few sets for pagination testing
      for (let i = 0; i < 15; i++) {
        await $fetch("/sets", {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
          },
          body: { ids: `loop-set-${i}-meal1,loop-set-${i}-meal2` },
        });
      }

      const limit = 5;
      const offset = 5;

      await $fetch("/sets", {
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
      await $fetch("/sets", {
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

    it("should filter sets by date range", async () => {
      const startDate = new Date().toISOString();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      // Create a set after startDate
      await $fetch("/sets", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: { ids: "date-test-meal1,date-test-meal2" },
      });

      const endDate = new Date().toISOString();

      await $fetch("/sets", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        query: { startDate, endDate },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });
  });

  describe("GET /sets/:id", () => {
    it("should retrieve a specific set", async () => {
      // Ensure we have an id from previous tests or create one
      if (!id) {
        const newSet = { ids: "test-set-for-get-meal1,test-set-for-get-meal2" };
        await $fetch("/sets", {
          baseURL: process.env.API_URL,
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
          },
          body: newSet,
          onResponse: ({ response }) => {
            id = response._data.data._id;
          },
        });
      }

      await $fetch(`/sets/${id}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.data).toBeDefined();
          expect(response._data.data._id).toBe(id);
        },
      });
    });

    it("should return 404 if set is not found", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/sets/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "GET",
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

    it("should return 400 if set ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/sets/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "GET",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid set ID");
        },
      });
    });
  });

  describe("PUT /sets/:id", () => {
    it("should update an existing set", async () => {
      const updatedSetData = {
        ids: "updated-meal1,updated-meal2,updated-meal3",
      };
      await $fetch(`/sets/${id}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: updatedSetData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Set updated successfully");
          expect(response._data.data.ids).toBe(updatedSetData.ids);
        },
      });
    });

    it("should return 404 if trying to update a non-existent set", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      const updatedSetData = { ids: "nonexistent-meal1,nonexistent-meal2" };
      await $fetch(`/sets/${nonExistentId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: updatedSetData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 400 if set ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      const updatedSetData = { ids: "invalid-meal1,invalid-meal2" };
      await $fetch(`/sets/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        body: updatedSetData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid set ID");
        },
      });
    });
  });

  describe("DELETE /sets/:id", () => {
    it("should delete an existing set", async () => {
      await $fetch(`/sets/${id}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Set deleted successfully");
        },
      });
    });

    it("should return 404 if trying to delete a non-existent set", async () => {
      const nonExistentId = "605c72ef29592b001c000000";
      await $fetch(`/sets/${nonExistentId}`, {
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

    it("should return 400 if set ID is invalid", async () => {
      const invalidId = "invalid-id-format";
      await $fetch(`/sets/${invalidId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid set ID");
        },
      });
    });
  });
});
