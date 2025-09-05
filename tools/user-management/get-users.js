import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const serviceDataCsv = join(process.cwd(), "apps/service/.data/users.csv");

export async function getUsers() {
  try {
    if (!existsSync(serviceDataCsv)) {
      return [];
    }
    let content = await readFile(serviceDataCsv, { encoding: "utf8" });

    // Remove UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
    const users = [];
    for (const line of lines) {
      // Use simple CSV parsing for 3 fields: username, role, hash
      // fgetcsv used in PHP writes standard CSV; here we split, handling quoted commas
      const cols = parseCsvLine(line);
      if (cols.length >= 2) {
        const username = cols[0];
        const role = cols[1];
        users.push({ username, role });
      }
    }
    return users;
  } catch {
    return [];
  }
}

function parseCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',') {
        result.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur);
  return result;
}
