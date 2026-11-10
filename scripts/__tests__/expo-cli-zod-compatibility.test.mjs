import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import test from "node:test";

// Exercise the CLI actually selected by Expo, not a second CLI installation or
// a reimplementation of its schemas. CLI58.1.19 uses JSON Schema for plugins;
// its MCP factory accepts a caller-supplied Zod instance, not its own dependency.
const mobileRequire = createRequire(new URL("../../mobile/app/package.json", import.meta.url));
const expoRequire = createRequire(mobileRequire.resolve("expo/package.json"));
const cliManifestPath = expoRequire.resolve("@expo/cli/package.json");
const cliRequire = createRequire(cliManifestPath);
const cliManifest = cliRequire(cliManifestPath);
const serverPath = join(dirname(cliManifestPath), "build", "src", "start", "server");
// Resolve the injected library from a package that explicitly declares it.
// cliRequire("zod") would depend on incidental pnpm hoisting in the new CLI.
const contractsRequire = createRequire(
  new URL("../../shared/contracts/package.json", import.meta.url),
);
const contractsManifest = contractsRequire("./package.json");
const { z } = contractsRequire("zod");
const { validate, ValidationError } = cliRequire("@expo/schema-utils");
const { PluginSchema, DevToolsPluginOutputSchema } = cliRequire(
  join(serverPath, "devtools", "DevToolsPlugin.schema.js"),
);
const { DevToolsPlugin } = cliRequire(join(serverPath, "devtools", "DevToolsPlugin.js"));
const { createMCPDevToolsExtensionSchema } = cliRequire(
  join(serverPath, "mcp", "createMCPDevToolsExtensionSchema.js"),
);

const plugin = {
  packageName: "fixture-devtools",
  packageRoot: "/fixture/devtools",
  webpageRoot: "/fixture/devtools/web",
  bannerTitle: "Fixture tools",
  serverEntryPoint: "/fixture/devtools/server.js",
  cliExtensions: {
    description: "Local schema compatibility fixture; never executes a command.",
    entryPoint: "commands.js",
    commands: [
      {
        name: "inspect",
        title: "Inspect fixture",
        environments: ["cli", "mcp"],
        parameters: [
          { name: "query", type: "text", description: "Fixture text" },
          { name: "limit", type: "number" },
          { name: "confirmed", type: "confirm" },
        ],
      },
      { name: "reset", title: "Reset fixture", environments: ["mcp"] },
    ],
  },
};

function validatePlugin(value) {
  validate(PluginSchema, value);
  return value;
}

function assertSchemaFailure(schema, value) {
  assert.throws(
    () => validate(schema, value),
    (error) => {
      assert.ok(error instanceof ValidationError);
      assert.ok(error.errors.length > 0);
      assert.ok(error.toErrorsMessage().join("").length > 0);
      for (const issue of error.errors) {
        assert.equal(typeof issue.path, "string");
        assert.equal(typeof issue.message, "string");
        assert.ok(issue.message.length > 0);
      }
      return true;
    },
  );
}

function assertIssues(result) {
  assert.equal(result.success, false);
  assert.ok(Array.isArray(result.error.issues));
  assert.ok(result.error.issues.length > 0);
  // The CLI displays validation errors through this public API.
  assert.ok(result.error.issues.map((issue) => issue.message).join(", ").length > 0);
  for (const issue of result.error.issues) assert.ok(Array.isArray(issue.path));
}

test("Expo's actual CLI validates JSON plugin/output schemas without a declared Zod dependency", () => {
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"])
    assert.equal(cliManifest[field]?.zod, undefined);
  assert.equal(typeof cliManifest.dependencies["@expo/schema-utils"], "string");
  assert.equal(PluginSchema.type, "object");
  assert.equal(DevToolsPluginOutputSchema.type, "array");
  assert.deepEqual(validatePlugin(plugin), plugin);
});

test("CLI MCP factory requires and uses the explicitly injected declared Zod4 library", () => {
  const injectedVersion = contractsRequire("zod/package.json").version;
  assert.equal(injectedVersion, contractsManifest.dependencies.zod);
  assert.match(injectedVersion, /^4\./u);
  const reads = new Set();
  const observedZod = new Proxy(z, {
    get(target, key, receiver) {
      reads.add(key);
      return Reflect.get(target, key, receiver);
    },
  });
  const schema = createMCPDevToolsExtensionSchema(validatePlugin(plugin), observedZod);
  assert.ok(schema instanceof z.ZodObject);
  assert.ok(reads.has("object"));
  assert.deepEqual(schema.parse({ command: "inspect", limit: 2 }), {
    command: "inspect",
    limit: 2,
  });
  assert.throws(() => createMCPDevToolsExtensionSchema(validatePlugin(plugin)), TypeError);
});

test("CLI plugin validation accepts optional fields without mutating their values", () => {
  const input = structuredClone(plugin);
  const before = structuredClone(input);
  const parsed = validatePlugin(input);
  assert.deepEqual(input, before);
  assert.deepEqual(parsed.cliExtensions, before.cliExtensions);
  const instance = new DevToolsPlugin(input, "/fixture");
  assert.equal(instance.packageName, plugin.packageName);
  assert.equal(instance.packageRoot, plugin.packageRoot);
  assert.deepEqual(instance.cliExtensions, plugin.cliExtensions);
  for (const change of [{ webpageRoot: "/outside" }, { serverEntryPoint: "/outside" }]) {
    assert.throws(
      () => new DevToolsPlugin({ ...input, ...change }, "/fixture"),
      /is not inside packageRoot/u,
    );
  }
  for (const bannerTitle of [true, false, "Tools"])
    assert.equal(validatePlugin({ ...plugin, bannerTitle }).bannerTitle, bannerTitle);
  assert.deepEqual(validatePlugin({ packageName: "minimal", packageRoot: "/fixture/minimal" }), {
    packageName: "minimal",
    packageRoot: "/fixture/minimal",
  });
});

test("CLI plugin validation still rejects malformed descriptors with readable issue paths", () => {
  for (const value of [
    { ...plugin, packageName: "" },
    { ...plugin, packageRoot: "" },
    { ...plugin, bannerTitle: 1 },
    { ...plugin, cliExtensions: { ...plugin.cliExtensions, commands: [] } },
    {
      ...plugin,
      cliExtensions: {
        ...plugin.cliExtensions,
        commands: [{ ...plugin.cliExtensions.commands[0], environments: ["browser"] }],
      },
    },
    {
      ...plugin,
      cliExtensions: {
        ...plugin.cliExtensions,
        commands: [
          {
            ...plugin.cliExtensions.commands[0],
            parameters: [{ name: "query", type: "unsupported" }],
          },
        ],
      },
    },
  ])
    assertSchemaFailure(PluginSchema, value);
});

test("actual CLI MCP schemas accept optional typed parameters and refuse coercion or extra keys", () => {
  const parsedPlugin = validatePlugin(plugin);
  const before = structuredClone(parsedPlugin);
  const schema = createMCPDevToolsExtensionSchema(parsedPlugin, z);
  assert.ok(schema instanceof z.ZodObject);
  assert.deepEqual(parsedPlugin, before);
  for (const value of [
    { command: "inspect" },
    { command: "reset" },
    { command: "inspect", query: "carton", limit: 2, confirmed: false },
  ])
    assert.deepEqual(schema.parse(value), value);
  for (const value of [
    {},
    { command: "unknown" },
    { command: "inspect", query: 1 },
    { command: "inspect", limit: "2" },
    { command: "inspect", confirmed: "true" },
    { command: "inspect", unexpected: true },
  ])
    assertIssues(schema.safeParse(value));
  // Upstream creates a flat optional-parameter schema, not per-command required
  // parameters. This check intentionally does not promise stricter semantics.
});

test("CLI MCP schema JSON conversion retains strict Draft 7 command and parameter types", () => {
  const schema = createMCPDevToolsExtensionSchema(validatePlugin(plugin), z);
  const json = z.toJSONSchema(schema, { target: "draft-7", io: "input" });
  assert.equal(json.$schema, "http://json-schema.org/draft-07/schema#");
  assert.equal(json.type, "object");
  assert.equal(json.additionalProperties, false);
  assert.deepEqual(json.required, ["command"]);
  assert.deepEqual(json.properties.command.enum, ["inspect", "reset"]);
  assert.equal(json.properties.query.type, "string");
  assert.equal(json.properties.limit.type, "number");
  assert.equal(json.properties.confirmed.type, "boolean");
  assert.match(json.properties.query.description, /Fixture text/u);
});

test("CLI MCP schema creation still fails clearly when a plugin has no commands", () => {
  for (const value of [
    { packageName: "no-extension", packageRoot: "/fixture" },
    { ...plugin, cliExtensions: { ...plugin.cliExtensions, commands: [] } },
  ])
    assert.throws(() => createMCPDevToolsExtensionSchema(value, z), /has no commands defined/u);
});

test("CLI output schemas keep text/audio/image validation and readable failures", () => {
  const output = [
    { type: "text", text: "Fixture ready", level: "info" },
    { type: "audio", url: "https://example.test/fixture.mp3", text: "Fixture audio" },
    { type: "image", url: "https://example.test/fixture.png" },
  ];
  const before = structuredClone(output);
  validate(DevToolsPluginOutputSchema, output);
  assert.deepEqual(output, before);
  validate(DevToolsPluginOutputSchema, []);
  for (const value of [
    {},
    [{ type: "text", text: "Fixture", level: "debug" }],
    [{ type: "audio", url: "not a URL" }],
    [{ type: "image", url: 42 }],
    [{ type: "unknown", text: "Fixture" }],
  ])
    assertSchemaFailure(DevToolsPluginOutputSchema, value);
});
