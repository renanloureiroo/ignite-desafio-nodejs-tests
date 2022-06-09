export interface IGetStatementOperationDTO {
  user_id: string;
  statement_id: string;
}

export type ICreateTransfer = {
  sender_id: string;
  amount: number;
  description: string;
};
