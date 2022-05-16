import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("CreateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456",
      })
      .expect(201);
  });

  it("should not be able to create new user with email already registered", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456",
      })
      .expect(400);
  });
});
