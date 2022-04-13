export type ApiRequestBody = {
  url: string;
};

export type ApiResponseSuccess = {
  original_url: string;
  short_url: number;
};

export type ApiResponseFail = {
  error: string;
};

export type ApiResponse = ApiResponseSuccess | ApiResponseFail;

export type DatabaseEntry = {
  url: string;
};

export type Database = ReadonlyArray<DatabaseEntry>;
