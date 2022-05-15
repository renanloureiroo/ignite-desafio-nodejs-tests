import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to get balance", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await statementsRepository.create({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit description",
    });

    await statementsRepository.create({
      user_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 10,
      description: "Withdraw description",
    });

    const { balance, statement } = await getBalanceUseCase.execute({
      user_id: user.id!,
    });

    expect(balance).toEqual(90);
    expect(statement).toHaveLength(2);
  });

  it("should not be able to get balance with user not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "1",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
