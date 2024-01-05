export type DispatchMessageBody = {
  message: string;
  phoneNumber: string;
};

export type LogContext = Record<string, string | number | boolean>;
