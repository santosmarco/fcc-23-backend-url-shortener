import dns from "dns";
import type { Request, RequestHandler, Response } from "express";
import fs from "fs";
import path from "path";
import type {
  ApiRequestBody,
  ApiResponse,
  ApiResponseFail,
  ApiResponseSuccess,
  Database,
  DatabaseEntry,
} from "./types";

const SHORTENED_URLS_JSON_PATH = path.resolve(__dirname, "..", "db.json");

export const handleShortenUrl = async (
  req: Request<unknown, ApiResponse>,
  res: Response
) => {
  const { body } = req;

  if (!(await validateRequestBody(body))) {
    res.json(buildResponseFail());
    return;
  }

  const { url } = body;

  const database = getDatabase();

  const { updated: updatedDatabase, shortened: shortenedUrl } =
    insertIntoDatabase(database, { url });

  saveDatabase(updatedDatabase);

  res.json(buildResponseSuccess(url, shortenedUrl));
};

export const handleRedirectToShortenedUrl: RequestHandler<
  { url?: string },
  ApiResponse
> = (req, res) => {
  const {
    params: { url },
  } = req;

  if (!validateShortenedUrl(url)) {
    res.json(buildResponseFail());
    return;
  }

  const shortenedIdx = parseShortenedUrl(url);
  const entry = getShortenedUrlByIdx(shortenedIdx);

  if (!entry) {
    res.json(buildResponseFail());
    return;
  }

  res.redirect(entry.url);
};

const validateRequestBody = async (body: unknown): Promise<boolean> => {
  return validateBodyStructure(body) && (await validateBodyUrl(body.url));
};

const validateBodyStructure = (body: unknown): body is ApiRequestBody => {
  return (
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
  );
};

const validateBodyUrl = (url: string): Promise<boolean> => {
  try {
    const urlObject = new URL(url);
    return new Promise((resolve) => {
      return dns.lookup(urlObject.hostname, (err) => {
        resolve(!err);
      });
    });
  } catch (err) {
    return Promise.resolve(false);
  }
};

const validateShortenedUrl = (url: string | undefined): url is string => {
  return !!url && !isNaN(Number.parseInt(url));
};

const parseShortenedUrl = (url: string): number => {
  return Number.parseInt(url);
};

const getDatabase = (): Database => {
  ensureDatabaseExists();

  const databaseRaw = fs.readFileSync(SHORTENED_URLS_JSON_PATH, {
    encoding: "utf-8",
  });

  return JSON.parse(databaseRaw) as Database;
};

const ensureDatabaseExists = (): void => {
  if (!fs.existsSync(SHORTENED_URLS_JSON_PATH)) {
    fs.writeFileSync(SHORTENED_URLS_JSON_PATH, "[]");
  }
};

const insertIntoDatabase = (
  database: Database,
  entry: DatabaseEntry
): { updated: Database; shortened: number } => {
  const updatedDatabase = [...database, entry];
  return {
    updated: updatedDatabase,
    shortened: updatedDatabase.length - 1,
  };
};

export const saveDatabase = (database: Database): void => {
  ensureDatabaseExists();

  const databaseStr = JSON.stringify(database);

  fs.writeFileSync(SHORTENED_URLS_JSON_PATH, databaseStr);
};

const getShortenedUrlByIdx = (idx: number): DatabaseEntry | undefined => {
  const db = getDatabase();
  return db[idx];
};

const buildResponseSuccess = (
  url: string,
  shortenedIdx: number
): ApiResponseSuccess => {
  return {
    original_url: url,
    short_url: shortenedIdx,
  };
};

const buildResponseFail = (): ApiResponseFail => {
  return { error: "invalid url" };
};
