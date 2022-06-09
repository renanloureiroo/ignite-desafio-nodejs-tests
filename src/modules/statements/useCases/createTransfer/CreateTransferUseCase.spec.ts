import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let user: User;
let user2: User;
let createTransferUseCase: CreateTransferUseCase;

describe("Create transfer use case", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createTransferUseCase = new CreateTransferUseCase();

    user = await usersRepository.create({
      email: "johndoe@emil.com",
      name: "John Doe",
      password: "123456",
    });

    user2 = await usersRepository.create({
      email: "joanadoe@emil.com",
      name: "Joana Doe",
      password: "123456",
    });
  });

  it("should be able to make a transfer", async () => {
    await statementsRepository.create({
      amount: 3000,
      description: "Salário",
      type: OperationType.DEPOSIT,
      user_id: user.id!,
    });

    await createTransferUseCase.execute({
      sender_id: user.id!,
      receive: user2.id!,
      amount: 1000,
      description: "Quantia para pagar conta de luz",
    });
  });
});
