import { Statement } from "../../entities/Statement";

type IStatement = Pick<
  Statement,
  "user_id" | "description" | "amount" | "type"
>;

export type ICreateStatementDTO = {
  receive_id?: string;
} & IStatement;
