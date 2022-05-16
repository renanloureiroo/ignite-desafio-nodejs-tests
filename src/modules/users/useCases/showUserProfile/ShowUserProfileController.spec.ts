import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import request from "supertest";

import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

const jwtMocked = {
  jwt: {
    secret: "secret",
    expiresIn: "1d",
  },
};

jest.mock("../../../../config/auth");

let connection: Connection;

describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    const password = await hash("123456", 8);
    const id = uuid();
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        VALUES('${id}', 'John Doe', 'johndoe@email.com', '${password}', 'now()')`
    );

    jest.mocked(authConfig).jwt = jwtMocked.jwt;
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    });

    const { token } = body;

    await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
        expect(response.body).toHaveProperty("created_at");
      });
  });

  it("should be able to show user profile", async () => {
    await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer invalid-token`,
      })
      .expect(401);
  });
});
