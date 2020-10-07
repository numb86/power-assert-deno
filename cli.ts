// Copyright 2020-present numb86. All rights reserved. MIT license.
import { argumentsParse } from "./src/deps.ts";

import { convertTestCode } from "./src/convert_test_code.ts";

const TARGET_EXTENSIONS = ["js", "mjs", "ts", "jsx", "tsx"];

const currentAbsolutePath = Deno.cwd();
const parsedArgs = argumentsParse(Deno.args);
const firstArg: string | undefined = (parsedArgs._[0] as string | undefined);

const flags = Object.entries(parsedArgs).filter((entry) => {
  if (entry[0] === "_") return false;
  return entry[1];
}).map((entry) => `--${entry[0]}`);

const adjustedFirstArg = firstArg && firstArg.endsWith("/")
  ? firstArg.slice(0, firstArg.length - 1)
  : firstArg;

function isTestFileName(arg: string): boolean {
  return TARGET_EXTENSIONS.some((extension) =>
    arg.endsWith(`.test.${extension}`) || arg.endsWith(`_test.${extension}`)
  );
}

async function getTestFileNames(path: string) {
  if (isTestFileName(path)) {
    return [path];
  }
  const files: string[] = [];
  for await (const dirEntry of Deno.readDir(path)) {
    if (dirEntry.isFile && isTestFileName(dirEntry.name)) {
      files.push(`${path}/${dirEntry.name}`);
    }
    if (dirEntry.isDirectory) {
      const children = await getTestFileNames(`${path}/${dirEntry.name}`);
      files.push(...children);
    }
  }
  return files;
}

function getAbsolutePath(path: string): string {
  if (path.startsWith("/")) {
    return path;
  }
  if (path.startsWith("./")) {
    return `${currentAbsolutePath}${path.slice(1)}`;
  }
  if (path.startsWith("../")) {
    let pathArray = path.split("../");

    let done = false;
    let count = 0;
    pathArray.forEach((elem) => {
      if (elem !== "") {
        done = true;
      }
      if (!done) {
        count += 1;
      }
    });

    const currentPathArray = currentAbsolutePath.split("/");
    for (let i = count; i > 0; i -= 1) {
      pathArray.shift();
      currentPathArray.pop();
    }

    return `${currentPathArray.join("/")}/${pathArray.join("../")}`;
  }

  return `${currentAbsolutePath}/${path}`;
}

const targetFilePaths = adjustedFirstArg === undefined
  ? await getTestFileNames(getAbsolutePath(Deno.cwd()))
  : await getTestFileNames(getAbsolutePath(adjustedFirstArg));

const tempDirName = await Deno.makeTempDir();

const writeFilePromises = targetFilePaths.map(async (filePath) => {
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    const testProcess = Deno.run({
      cmd: ["deno", "run", filePath],
    });
    const typeCheck = await testProcess.status();
    if (!typeCheck.success) {
      Deno.exit(typeCheck.code);
    }
  }

  const fileText = await Deno.readTextFile(filePath);
  const jsSourceCode = await Deno.transpileOnly(
    { [filePath]: fileText },
    { target: "es2020" },
  );
  const convertedSourceCode = convertTestCode(
    jsSourceCode[filePath].source,
    filePath,
  );
  const tempFileName = `${tempDirName}/${filePath.replaceAll("/", "-")}`;
  return Deno.writeTextFile(tempFileName, convertedSourceCode);
});

await Promise.all(writeFilePromises);

const testProcessCmd = ["deno", "test", "--no-check"];
flags.forEach((flag) => {
  testProcessCmd.push(flag);
});
testProcessCmd.push(tempDirName);
const testProcess = Deno.run({
  cmd: testProcessCmd,
});
await testProcess.status();

const tempDirRemoveProcess = Deno.run({
  cmd: ["rm", "-rf", tempDirName],
});
await tempDirRemoveProcess.status();
