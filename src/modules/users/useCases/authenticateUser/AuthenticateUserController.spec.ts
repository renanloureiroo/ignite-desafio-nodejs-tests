import { Connection } from "typeorm";
import request from "supertest";

import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";
import { app } from "../../../../app";

const jwtMocked = {
  jwt: {
    secret: "secret",
    expiresIn: "1d",
  },
};

jest.mock("../../../../config/auth");

let connection: Connection;
describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    jest.mocked(authConfig).jwt = jwtMocked.jwt;
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@email.com",
        password: "123456",
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
      });
  });

  it("should not be able to authenticate user with invalid password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "johndoe@email.com",
        password: "incorrect-password",
      })
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual({
          message: "Incorrect email or password",
        });
      });
  });

  it("should not be able to authenticate user with invalid email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "incorrectemail@email.com",
        password: "123456",
      })
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual({
          message: "Incorrect email or password",
        });
      });
  });
});
