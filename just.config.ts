// From: https://github.com/microsoft/minecraft-samples/blob/main/addon_starter/1_hello_world/just.config.ts
import { argv, parallel, series, task, tscTask } from "just-scripts";
import {
  BundleTaskParameters,
  CopyTaskParameters,
  bundleTask,
  cleanTask,
  cleanCollateralTask,
  copyFiles,
  copyTask,
  coreLint,
  mcaddonTask,
  setupEnvironment,
  ZipTaskParameters,
  STANDARD_CLEAN_PATHS,
  DEFAULT_CLEAN_DIRECTORIES,
  getOrThrowFromProcess,
  watchTask,
} from "@minecraft/core-build-tasks";
import { changelogTask, minifyTask } from "@lpsmods/mc-build";
import path from "path";
import { buildPacks } from "./build";

const stageDir = path.resolve(__dirname, "build");
const stageBP = path.join(stageDir, "behavior_packs");
const stageRP = path.join(stageDir, "resource_packs");
const generatedDir = path.join(stageDir, "generated");

// Setup env variables
setupEnvironment(path.resolve(__dirname, ".env"));
const projectName = getOrThrowFromProcess("PROJECT_NAME");
const projectVersion = getOrThrowFromProcess("PROJECT_VERSION");

const bundleTaskOptions: BundleTaskParameters = {
  entryPoint: path.join(__dirname, "./scripts/main.ts"),
  external: ["@minecraft/server", "@minecraft/server-ui"],
  outfile: path.resolve(__dirname, "./dist/scripts/main.js"),
  minifyWhitespace: true,
  sourcemap: true,
  outputSourcemapPath: path.resolve(__dirname, "./dist/debug"),
  alias: {
    "#changelog": path.join(generatedDir, "changelog.ts"),
  },
};

const copyTaskOptions: CopyTaskParameters = {
  copyToBehaviorPacks: [path.join(stageBP, projectName)],
  copyToScripts: ["./dist/scripts"],
  copyToResourcePacks: [path.join(stageRP, projectName)],
};

const mcaddonTaskOptions: ZipTaskParameters = {
  ...copyTaskOptions,
  outputFile: `./dist/packages/${projectName}-${projectVersion}.mcaddon`,
};

// Lint
task("lint", coreLint(["scripts/**/*.ts"], argv().fix));

// Build
task("typescript", tscTask());
task("bundle", bundleTask(bundleTaskOptions));
task("stage-packs", () => {
  copyFiles([path.join(__dirname, "behavior_packs", projectName)], path.join(stageBP, projectName));
  copyFiles([path.join(__dirname, "resource_packs", projectName)], path.join(stageRP, projectName));
});
task("stage-scripts", () => {
  copyFiles([path.join(__dirname, "dist", "scripts")], path.join(stageBP, projectName, "scripts"));
});
task("generate", () => buildPacks(path.join(stageBP, projectName), path.join(stageRP, projectName)));
task("minify", minifyTask([path.join(stageBP, projectName), path.join(stageRP, projectName)]));
task(
  "changelog",
  changelogTask({
    markdownFile: path.join(__dirname, "CHANGELOG.md"),
    inGameFile: path.join(generatedDir, "changelog.ts"),
  }),
);
task("clean-stage", cleanTask([stageDir]));
task(
  "build",
  series("clean-stage", "stage-packs", "changelog", "typescript", "bundle", "stage-scripts", "generate", "minify"),
);

// Clean
task("clean-local", cleanTask(DEFAULT_CLEAN_DIRECTORIES));
task("clean-collateral", cleanCollateralTask(STANDARD_CLEAN_PATHS));
task("clean", parallel("clean-local", "clean-collateral"));

// Package
task("copyArtifacts", copyTask(copyTaskOptions));
task("package", series("clean-collateral", "copyArtifacts"));

// Local Deploy used for deploying local changes directly to output via the bundler. It does a full build and package first just in case.
task(
  "local-deploy",
  watchTask(
    ["scripts/**/*.ts", "behavior_packs/**/*.{json,lang,png}", "resource_packs/**/*.{json,lang,png}"],
    series("clean-local", "build", "package"),
  ),
);

// Mcaddon
task("createMcaddonFile", mcaddonTask(mcaddonTaskOptions));
task("mcaddon", series("clean-local", "build", "createMcaddonFile"));
