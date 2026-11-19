# @ui-monorepo/rego

A tiny, dependency-free builder for generating [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/)
(Open Policy Agent) policy source from TypeScript.

## Usage

```ts
import { regoPolicy } from '@ui-monorepo/rego';

const src = regoPolicy('authz')
  .default('allow', false)
  .allowIf('input.user.role == "admin"')
  .allowIf(['input.method == "GET"', 'input.path[0] == "public"'])
  .denyIf('input.method == "DELETE"', 'deletes are not permitted')
  .build();

console.log(src);
```

produces:

```rego
package authz

import rego.v1

default allow := false

allow if {
	input.user.role == "admin"
}

allow if {
	input.method == "GET"
	input.path[0] == "public"
}

deny contains msg if {
	input.method == "DELETE"
	msg := "deletes are not permitted"
}
```

## Generating policy files

The package ships a generator script that writes `.rego` files to disk. Edit the
`policies` array in [`scripts/gen.ts`](./scripts/gen.ts), then run:

```bash
# from the repo root
npm run gen -w @ui-monorepo/rego

# or from this package directory
npm run gen
```

Output is written to `packages/rego/generated/` (git-ignored).

## API

| Method | Description |
| --- | --- |
| `regoPolicy(name)` | Start a policy for a package (e.g. `"authz"` or `"app.rbac.v1"`). |
| `.import(path)` | Add an `import` (`rego.v1` is included automatically). |
| `.default(name, value)` | Emit `default <name> := <value>`. |
| `.allowIf(conditions)` | Add an `allow if { ... }` block. Multiple blocks are ORed. |
| `.denyIf(conditions, msg)` | Add a `deny contains msg if { ... }` block. |
| `.rule(name, conditions)` | Add a custom `<name> if { ... }` rule. |
| `.raw(block)` | Append pre-formatted Rego verbatim. |
| `.build()` | Render the policy to a string. |

`conditions` is a single expression string, or an array of expressions that are
ANDed together within one rule block. Scalar values are emitted as Rego literals
(strings quoted, numbers and booleans bare).
