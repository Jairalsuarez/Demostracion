import { rm } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const removablePaths = [
  join(distDir, "carrusel"),
  join(distDir, "images", "github.png"),
];

await Promise.all(
  removablePaths.map((target) =>
    rm(target, { force: true, recursive: true }).catch(() => undefined)
  )
);
