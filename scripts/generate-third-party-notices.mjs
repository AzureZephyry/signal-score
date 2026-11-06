import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const sections = [
  "Signal / Score third-party notices\n\nThese notices apply to third-party components only. They do not grant a license to Signal / Score's own source, documentation or artwork. This conservative inventory includes installed non-development dependencies, optional packages and type declarations, whether or not every module is emitted by Vite. Versions come from package-lock.json.\n",
];
for (const [directory, entry] of Object.entries(lock.packages).sort(
  ([a], [b]) => a.localeCompare(b),
)) {
  if (!directory || entry.dev) continue;
  const pkg = JSON.parse(
    await readFile(path.join(directory, "package.json"), "utf8"),
  );
  const names = (await readdir(directory))
    .filter((name) => /^(license|copying|notice)(\.|-|$)/i.test(name))
    .sort();
  sections.push(
    `\n${"=".repeat(72)}\n${pkg.name} ${pkg.version}\nDeclared license: ${pkg.license}\n`,
  );
  if (pkg.version !== entry.version)
    throw new Error(`Install differs from lockfile: ${directory}`);
  for (const name of names)
    sections.push(
      `\n--- ${name} ---\n${await readFile(path.join(directory, name), "utf8")}`,
    );
  if (pkg.name === "gsap") {
    const source = await readFile(
      path.join(directory, "src/gsap-core.js"),
      "utf8",
    );
    sections.push(
      source.match(/^\/\*![\s\S]*?\*\//)[0] +
        "\nLicense terms: https://gsap.com/standard-license\nGSAP is separately licensed; it is not MIT or Apache licensed by this project.\n",
    );
  } else if (!names.length)
    throw new Error(`Review missing license text: ${pkg.name}`);
  if (pkg.name === "pako") {
    const source = await readFile(
      path.join(directory, "lib/zlib/deflate.js"),
      "utf8",
    );
    sections.push(
      "\n--- Bundled Zlib notice from lib/zlib/deflate.js ---\n" +
        source.slice(source.indexOf("// (C)"), source.indexOf("\nconst ")),
    );
  }
  if (pkg.name === "dompurify")
    sections.push(
      "\n--- Bundled attribution ---\n" +
        (
          await readFile(path.join(directory, "dist/purify.es.mjs"), "utf8")
        ).split("\n")[0],
    );
}
const text = sections.join("\n").replaceAll("\r\n", "\n");
const target = "public/licenses/THIRD-PARTY-NOTICES.txt";
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8")).replaceAll("\r\n", "\n") !== text)
    throw new Error("Third-party notices need regeneration.");
  console.log("Third-party notices match the installed lockfile.");
} else {
  await writeFile(target, text);
  console.log(`Wrote ${target}`);
}
