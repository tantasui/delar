import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join, resolve } from "path";
import { SUI_CLI_CMD, TATUM_RPC } from "./constants";

interface DeployOutput {
  packageId: string;
  feeConfigId?: string;
  network: string;
  deployedAt: string;
}

function getActiveEnv(): string {
  const clientPath = join(homedir(), ".sui", "sui_config", "client.yaml");
  if (!existsSync(clientPath)) return "testnet";
  const content = readFileSync(clientPath, "utf-8");
  const match = content.match(/active_env\s*:\s*(\S+)/);
  return match?.[1] ?? "testnet";
}

async function main() {
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY env var is required");
  }

  const packagePath = resolve(__dirname, "../delar");
  if (!existsSync(join(packagePath, "Move.toml"))) {
    throw new Error(`Package not found at ${packagePath}. Run 'sui move build' first.`);
  }

  const activeEnv = getActiveEnv();

  const suiBin = process.env.SUI_BIN ?? SUI_CLI_CMD ?? "sui";

  const tempDir = "/tmp/delar-deploy-" + Date.now();
  execSync(`mkdir -p ${tempDir}`, { stdio: "pipe" });

  const keyPath = join(tempDir, "deployer.key");
  writeFileSync(keyPath, deployerKey, "utf-8");

  try {
    const result = execSync(
      `${suiBin} client publish ` +
        `--gas-budget 500000000 ` +
        `--json ` +
        `--skip-dependency-verification ` +
        `--with-unpublished-dependencies ` +
        `--serialize-unsigned-raw-tx > /dev/null ` +
        `2>&1`,
      {
        cwd: packagePath,
        encoding: "utf-8",
        env: { ...process.env, SUI_KEY_FILE: keyPath },
      }
    );

    const json = JSON.parse(result);
    const pkgId = json?.objectChanges?.find(
      (c: any) => c?.type === "published"
    )?.packageId;

    if (!pkgId) {
      const fallback = JSON.parse(
        execSync(
          `${suiBin} client publish --gas-budget 500000000 --json --skip-dependency-verification --with-unpublished-dependencies`,
          {
            cwd: packagePath,
            encoding: "utf-8",
            env: { ...process.env, SUI_KEY_FILE: keyPath },
          }
        )
      );
      const fallbackPkgId =
        fallback?.objectChanges?.find((c: any) => c?.type === "published")
          ?.packageId ?? "unknown";

      const createdObjects = fallback?.effects?.created ?? [];
      const sharedObjects = createdObjects.filter(
        (o: any) => o?.owner?.Shared
      );

      const output: DeployOutput = {
        packageId: fallbackPkgId,
        network: activeEnv,
        deployedAt: new Date().toISOString(),
      };
      if (sharedObjects.length > 0) {
        output.feeConfigId = sharedObjects[0]?.objectId;
      }

      const outputPath = resolve(__dirname, "deployment.json");
      writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    const createdObjects = json?.effects?.created ?? [];
    const sharedObjects = createdObjects.filter(
      (o: any) => o?.owner?.Shared
    );

    const output: DeployOutput = {
      packageId,
      network: activeEnv,
      deployedAt: new Date().toISOString(),
    };
    if (sharedObjects.length > 0) {
      output.feeConfigId = sharedObjects[0]?.objectId;
    }

    const outputPath = resolve(__dirname, "deployment.json");
    writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
    console.log(JSON.stringify(output, null, 2));
  } catch (err: any) {
    console.error("Deployment failed:", err.message);
    process.exit(1);
  } finally {
    execSync(`rm -rf ${tempDir}`, { stdio: "pipe" });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
