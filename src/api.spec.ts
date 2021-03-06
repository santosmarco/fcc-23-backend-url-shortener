import type { Request, Response } from "express";
import {
  handleRedirectToShortenedUrl,
  handleShortenUrl,
  saveDatabase,
} from "./api";
import type { ApiResponse, ApiResponseFail, ApiResponseSuccess } from "./types";

const testShortenUrl = async <T extends ApiResponse = ApiResponse>(
  url: string
): Promise<T> => {
  const req = {
    body: { url },
  };

  let resBody = {} as T;

  const res = {
    json: jest.fn((arg) => {
      resBody = arg;
    }),
  };

  await handleShortenUrl(req as unknown as Request, res as unknown as Response);

  return resBody;
};

const redirectMock = jest.fn();

const testRedirectToShortenedUrl = <T extends ApiResponse = ApiResponse>(
  url: string
): T => {
  const req = {
    params: { url },
  };

  let resBody = {} as T;

  const res = {
    json: jest.fn((arg) => {
      resBody = arg;
    }),
    redirect: redirectMock,
  };

  handleRedirectToShortenedUrl(
    req as unknown as Request,
    res as unknown as Response,
    jest.fn()
  );

  return resBody;
};

describe("api", () => {
  beforeEach(() => {
    saveDatabase([]);
  });

  describe("handleShortenUrl", () => {
    it("should return the correct response", async () => {
      const res = await testShortenUrl<ApiResponseSuccess>(
        "https://www.google.com/"
      );
      expect(res).toEqual({
        original_url: "https://www.google.com/",
        short_url: 0,
      });
    });

    it("should return 'invalid url'", async () => {
      const res = await testShortenUrl<ApiResponseFail>("not a url");
      expect(res).toEqual({
        error: "invalid url",
      });
    });
  });

  describe("handleRedirectToShortenedUrl", () => {
    it("should redirect to the correct URL", async () => {
      const url = "https://www.google-redirect.com/";
      await testShortenUrl<ApiResponseSuccess>(url);
      testRedirectToShortenedUrl("0");
      expect(redirectMock).toHaveBeenCalledWith(url);
    });
  });
});
