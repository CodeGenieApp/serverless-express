import { expect } from "chai";
import request from "supertest";
import { describe, it } from "mocha";

import { app } from "../src/app";

describe("activities api", () => {
  describe("GET /users", () => {
    it("returns users list with status 200", async () => {
      const result = await request(app).get("/users");
      expect(result.status).to.equal(200);
      expect(result.body).deep.equal([
        {
          id: 1,
          name: "Joe",
        },
        {
          id: 2,
          name: "Jane",
        },
      ]);
    });
  });

  describe("GET /users/:userId", () => {
    it("returns user 1 with status code 200", async () => {
      const result = await request(app).get("/users/1");
      expect(result.status).to.equal(200);
      expect(result.body).deep.equal({
        id: 1,
        name: "Joe",
      });
    });

    it("returns empty body with status code 404", async () => {
      const result = await request(app).get("/users/10");
      expect(result.status).to.equal(404);
      expect(result.body).deep.equal({});
    });
  });
});
