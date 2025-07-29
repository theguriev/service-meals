import { describe, expect, it } from "vitest";

describe("Notes API", () => {
  let noteId: string;

  describe("POST /notes", () => {
    it("should create a new note", async () => {
      const noteData = {
        content: "This is a test note content",
      };

      await $fetch("/notes", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: noteData,
        onResponse: ({ response }) => {
          expect(response._data).toHaveProperty(
            "message",
            "Note added successfully"
          );
          expect(response._data.data).toHaveProperty("_id");
          expect(response._data.data.content).toBe(noteData.content);

          noteId = response._data.data._id;
        },
      });
    });

    it("should fail with missing required fields", async () => {
      await expect(
        $fetch("/notes", {
          method: "POST",
          body: { invalidField: "Invalid" },
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("GET /notes", () => {
    it("should retrieve notes with pagination", async () => {
      await $fetch("/notes?offset=0&limit=10", {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(Array.isArray(response._data)).toBe(true);
          if (response._data.length > 0) {
            expect(response._data[0]).toHaveProperty("_id");
            expect(response._data[0]).toHaveProperty("content");
            expect(response._data[0]).toHaveProperty("userId");
          }
        },
      });
    });

    it("should filter notes by search term", async () => {
      await $fetch("/notes?search=test", {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBeGreaterThan(0);
        },
      });

      await $fetch("/notes?search=notexist", {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data.length).toBe(0);
        },
      });
    });

    it("should filter notes by date", async () => {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      await $fetch(`/notes?date=${today}`, {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          console.log("log: respnse 1", response._data);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });

    it("should include all dates when includeAllDates=true", async () => {
      await $fetch("/notes?includeAllDates=true", {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          console.log("log: respnse 2", response._data);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });

    it("should default to today's notes when no date parameters provided", async () => {
      await $fetch("/notes", {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(Array.isArray(response._data)).toBe(true);
          // Should only return today's notes by default
        },
      });
    });
  });

  describe("GET /notes/:id", () => {
    it("should retrieve a specific note", async () => {
      await $fetch(`/notes/${noteId}`, {
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response._data).toHaveProperty("_id", noteId);
          expect(response._data).toHaveProperty("content");
        },
      });
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await expect(
        $fetch(`/notes/${fakeId}`, {
          baseURL: process.env.API_URL,
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
        })
      ).rejects.toThrow("404");
    });
  });

  describe("PUT /notes/:id", () => {
    it("should update a note", async () => {
      const updateData = {
        content: "Updated content",
      };

      await $fetch(`/notes/${noteId}`, {
        baseURL: process.env.API_URL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        body: updateData,
        onResponse: ({ response }) => {
          expect(response._data).toHaveProperty(
            "message",
            "Note updated successfully"
          );
          expect(response._data.data.content).toBe(updateData.content);
        },
      });
    });
  });

  describe("DELETE /notes/:id", () => {
    it("should delete a note", async () => {
      await $fetch(`/notes/${noteId}`, {
        baseURL: process.env.API_URL,
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },

        onResponse: ({ response }) => {
          expect(response._data).toHaveProperty(
            "message",
            "Note deleted successfully"
          );
          expect(response._data.data).toHaveProperty("_id", noteId);
        },
      });
    });

    it("should return 404 when trying to delete non-existent note", async () => {
      await expect(
        $fetch(`/notes/${noteId}`, {
          baseURL: process.env.API_URL,
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
          },
        })
      ).rejects.toThrow("404");
    });
  });
});
