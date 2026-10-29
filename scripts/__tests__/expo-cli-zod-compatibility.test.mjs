import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import test from "node:test";

// Exercise the CLI actually selected by Expo, not a second root-level dependency
// or a reimplementation of its schemas. Upstream still declares Zod 3, so the
// narrow security override must keep its real development-tool behavior working.
const mobileRequire = createRequire(new URL("../../mobile/app/package.json", import.meta.url));
const expoRequire = createRequire(mobileRequire.resolve("expo/package.json"));
const cliManifestPath = expoRequire.resolve("@expo/cli/package.json");
const cliRequire = createRequire(cliManifestPath);
const serverPath = join(dirname(cliManifestPath), "build", "src", "start", "server");
const { z } = cliRequire("zod");
const { PluginSchema, DevToolsPluginOutputSchema } = cliRequire(
  join(serverPath, "DevToolsPlugin.schema.js"),
);
const { createMCPDevToolsExtensionSchema } = cliRequire(
  join(serverPath, "createMCPDevToolsExtensionSchema.js"),
);

const plugin = {
  packageName: "fixture-devtools",
  packageRoot: "/fixture/devtools",
  webpageRoot: "/fixture/web",
  bannerTitle: "Fixture tools",
  serverEntryPoint: "server.js",
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

function assertIssues(result) {
  assert.equal(result.success, false);
  assert.ok(Array.isArray(result.error.issues));
  assert.ok(result.error.issues.length > 0);
  // The CLI displays validation errors through this public API.
  assert.ok(result.error.issues.map((issue) => issue.message).join(", ").length > 0);
  for (const issue of result.error.issues) assert.ok(Array.isArray(issue.path));
}

test("Expo's installed CLI resolves Zod 4 and builds its own plugin/output schemas with it", () => {
  assert.match(cliRequire("zod/package.json").version, /^4\./u);
  assert.ok(PluginSchema instanceof z.ZodObject);
  assert.ok(DevToolsPluginOutputSchema instanceof z.ZodArray);
  assert.deepEqual(PluginSchema.parse(plugin), plugin);
});

test("CLI plugin parsing accepts optional fields and preserves its readonly environment arrays", () => {
  const input = structuredClone(plugin);
  const before = structuredClone(input);
  const parsed = PluginSchema.parse(input);
  assert.deepEqual(input, before);
  assert.notEqual(parsed, input);
  for (const command of parsed.cliExtensions.commands) {
    assert.ok(Object.isFrozen(command.environments));
    assert.throws(() => command.environments.push("cli"), TypeError);
  }
  // Only environments are declared readonly upstream; commands/parameters are not.
  assert.equal(Object.isFrozen(parsed.cliExtensions.commands), false);
  for (const bannerTitle of [true, false, "Tools"])
    assert.equal(PluginSchema.parse({ ...plugin, bannerTitle }).bannerTitle, bannerTitle);
  assert.deepEqual(
    PluginSchema.parse({ packageName: "minimal", packageRoot: "/fixture/minimal" }),
    { packageName: "minimal", packageRoot: "/fixture/minimal" },
  );
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
    assertIssues(PluginSchema.safeParse(value));
});

test("actual CLI MCP schemas accept optional typed parameters and refuse coercion or extra keys", () => {
  const parsedPlugin = PluginSchema.parse(plugin);
  const before = structuredClone(parsedPlugin);
  const schema = createMCPDevToolsExtensionSchema(parsedPlugin);
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
  const schema = createMCPDevToolsExtensionSchema(PluginSchema.parse(plugin));
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
    assert.throws(() => createMCPDevToolsExtensionSchema(value), /has no commands defined/u);
});

test("CLI output schemas keep text/audio/image validation and readable failures", () => {
  const output = [
    { type: "text", text: "Fixture ready", level: "info" },
    { type: "audio", url: "https://example.test/fixture.mp3", text: "Fixture audio" },
    { type: "image", url: "https://example.test/fixture.png" },
  ];
  assert.deepEqual(DevToolsPluginOutputSchema.parse(output), output);
  assert.deepEqual(DevToolsPluginOutputSchema.parse([]), []);
  for (const value of [
    {},
    [{ type: "text", text: "Fixture", level: "debug" }],
    [{ type: "audio", url: "not a URL" }],
    [{ type: "image", url: 42 }],
    [{ type: "unknown", text: "Fixture" }],
  ])
    assertIssues(DevToolsPluginOutputSchema.safeParse(value));
});
