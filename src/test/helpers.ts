import {readFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {workbookToRaw} from "@/lib/xlsx/parse";
import type {RawWorkbook} from "@/lib/xlsx/sheets";

const here = dirname(fileURLToPath(import.meta.url));

export const loadFixture = (): RawWorkbook => {
	const buf = readFileSync(resolve(here, "fixtures/sample.xlsx"));
	return workbookToRaw(buf);
};
