export type DispatchMessageBody = {
  message: string;
  phoneNumber: string;
};

export type SqsMessageBody = DispatchMessageBody & {
  correlationId?: string;
};

export type SqsRecordBody = {
  Message: string;
  [key: string]: string;
}

export type LogContext = Record<string, string | number | boolean | undefined>;
