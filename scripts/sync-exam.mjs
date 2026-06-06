import { execFileSync, execSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const combinedRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const examRoot = resolve(combinedRoot, "..");

const modules = [
  { name: "moodul3", source: join(examRoot, "moodul3") },
  { name: "moodul4", source: join(examRoot, "moodul4") },
];

function gitFiles(cwd, pathspec = ".") {
  const output = execFileSync("git", ["ls-files", "-z", "--", pathspec], {
    cwd,
    encoding: "utf8",
  });

  return output.split("\0").filter(Boolean);
}

function assertInside(base, target) {
  const pathFromBase = relative(base, target);
  if (
    pathFromBase === ".." ||
    pathFromBase.startsWith(`..${sep}`) ||
    resolve(target) === resolve(base)
  ) {
    throw new Error(`Refusing to write outside the expected directory: ${target}`);
  }
}

function mirrorTrackedModule({ name, source }) {
  if (!existsSync(join(source, ".git"))) {
    throw new Error(`Canonical repository is missing: ${source}`);
  }

  const target = join(combinedRoot, "moodulid", name);
  const sourceFiles = new Set(gitFiles(source));
  const targetPrefix = `moodulid/${name}/`;
  const trackedTargetFiles = gitFiles(combinedRoot, `moodulid/${name}`).map((file) =>
    file.slice(targetPrefix.length),
  );

  for (const file of trackedTargetFiles) {
    if (sourceFiles.has(file)) continue;

    const targetFile = join(target, file);
    assertInside(target, targetFile);
    rmSync(targetFile, { force: true });
  }

  for (const file of sourceFiles) {
    const sourceFile = join(source, file);
    const targetFile = join(target, file);
    assertInside(source, sourceFile);
    assertInside(target, targetFile);
    mkdirSync(dirname(targetFile), { recursive: true });
    copyFileSync(sourceFile, targetFile);
  }

  console.log(`Mirrored ${sourceFiles.size} tracked files from ${name}.`);
}

function refreshPagesBuild() {
  const frontend = join(examRoot, "moodul3");
  const dist = join(frontend, "dist");

  execSync("npm run build", {
    cwd: frontend,
    stdio: "inherit",
  });

  const rootAssets = join(combinedRoot, "assets");
  rmSync(rootAssets, { recursive: true, force: true });
  cpSync(join(dist, "assets"), rootAssets, { recursive: true });

  const builtPages = new Set(
    readdirSync(dist).filter((file) => file.endsWith(".html")),
  );

  for (const file of builtPages) {
    copyFileSync(join(dist, file), join(combinedRoot, file));
  }

  for (const entry of readdirSync(dist, { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.endsWith(".html")) {
      copyFileSync(join(dist, entry.name), join(combinedRoot, entry.name));
    }
  }

  for (const file of gitFiles(combinedRoot)) {
    if (
      !file.includes("/") &&
      file.endsWith(".html") &&
      !builtPages.has(file)
    ) {
      rmSync(join(combinedRoot, file), { force: true });
    }
  }

  for (const folder of ["detail", "kohvisordid", "kontakt", "tellimus"]) {
    rmSync(join(combinedRoot, folder), { recursive: true, force: true });
  }

  console.log(`Refreshed ${builtPages.size} Pages documents and their assets.`);
}

for (const module of modules) {
  mirrorTrackedModule(module);
}

refreshPagesBuild();
console.log("Combined exam mirror is synchronized.");
