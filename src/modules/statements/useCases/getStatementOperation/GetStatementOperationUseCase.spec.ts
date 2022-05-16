import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("GetStatementOperationUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to get statement operation", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    const statement = await statementsRepository.create({
      user_id: user.id!,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "Deposit description",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    });

    expect(statementOperation).toEqual(statement);
  });

  it("should not be able to get statement operation with user not exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "1",
        statement_id: "fakeId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation with statementOperation not exist", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "fakeId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
