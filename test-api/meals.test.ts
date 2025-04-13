const baseURL = "http://localhost:4000";

const measurementBody = {
  timestamp: Date.now(),
  type: "temperature",
  meta: {
    unit: "Celsius",
    location: "office",
  },
};

let measurementId = undefined;

describe.sequential("Measurement", () => {
  const validAccessToken = issueAccessToken(
    { userId: 123 },
    { secret: process.env.SECRET }
  );

  describe("POST /measurement", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch("/measurement", {
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

    it("gets 200 on valid measurement data", async () => {
      await $fetch("/measurement", {
        baseURL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: measurementBody,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.measurement).toMatchObject(measurementBody);
          measurementId = response._data.measurement._id;
        },
      });
    });
  });

  describe("GET /measurement", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch("/measurement", {
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
      await $fetch("/measurement", {
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
          expect(response._data).toHaveProperty("measurements");
          expect(Array.isArray(response._data.measurements)).toBe(true);
        },
      });
    });
  });

  describe("PUT /measurement/:id", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch(`/measurement/${measurementId}`, {
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
      await $fetch(`/measurement/${measurementId}`, {
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
          expect(response._data).toHaveProperty("measurement");
          expect(response._data.measurement.type).toBe("humidity");
          expect(response._data.measurement.meta.unit).toBe("Percentage");
        },
      });
    });

    it("gets 404 if measurement not found or not authorized", async () => {
      await $fetch(`/measurement/invalidMeasurementId`, {
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
