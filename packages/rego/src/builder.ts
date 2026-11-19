/**
 * Conditions for a rule body. A single string is one expression; an array is
 * several expressions that are ANDed together within the same rule block.
 */
export type Conditions = string | string[];

/** A scalar that can be emitted as a Rego literal. */
export type RegoValue = string | number | boolean;

interface AllowRule {
  conditions: string[];
}

interface DenyRule {
  conditions: string[];
  message: string;
}

interface CustomRule {
  name: string;
  conditions: string[];
}

interface DefaultDecl {
  name: string;
  value: RegoValue;
}

const INDENT = '\t';

function toConditionList(conditions: Conditions): string[] {
  const list = Array.isArray(conditions) ? conditions : [conditions];
  const cleaned = list.map((c) => c.trim()).filter((c) => c.length > 0);
  if (cleaned.length === 0) {
    throw new Error('A rule needs at least one condition.');
  }
  return cleaned;
}

function regoLiteral(value: RegoValue): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

function isValidPackageName(name: string): boolean {
  // Dotted path of identifiers, e.g. "authz" or "app.rbac.v1".
  return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(name);
}

/**
 * Fluent builder that produces idiomatic Rego v1 policy source.
 *
 * @example
 * const src = regoPolicy('authz')
 *   .default('allow', false)
 *   .allowIf('input.user.role == "admin"')
 *   .denyIf('input.method == "DELETE"', 'deletes are not permitted')
 *   .build();
 */
export class RegoPolicyBuilder {
  private readonly imports: string[] = ['rego.v1'];
  private readonly defaults: DefaultDecl[] = [];
  private readonly allows: AllowRule[] = [];
  private readonly denies: DenyRule[] = [];
  private readonly customs: CustomRule[] = [];
  private readonly rawBlocks: string[] = [];
  private readonly packageName: string;

  constructor(packageName: string) {
    if (!isValidPackageName(packageName)) {
      throw new Error(`Invalid Rego package name: ${JSON.stringify(packageName)}`);
    }
    this.packageName = packageName;
  }

  /** Add an `import` statement. `rego.v1` is included by default. */
  import(path: string): this {
    if (!this.imports.includes(path)) {
      this.imports.push(path);
    }
    return this;
  }

  /** Declare a default value, e.g. `default allow := false`. */
  default(name: string, value: RegoValue): this {
    this.defaults.push({ name, value });
    return this;
  }

  /** Add an `allow if { ... }` block. Multiple blocks are logically ORed. */
  allowIf(conditions: Conditions): this {
    this.allows.push({ conditions: toConditionList(conditions) });
    return this;
  }

  /** Add a `deny contains msg if { ... }` block that yields `message`. */
  denyIf(conditions: Conditions, message: string): this {
    this.denies.push({ conditions: toConditionList(conditions), message });
    return this;
  }

  /** Add a custom `<name> if { ... }` rule. */
  rule(name: string, conditions: Conditions): this {
    this.customs.push({ name, conditions: toConditionList(conditions) });
    return this;
  }

  /** Append a raw, already-formatted block of Rego verbatim. */
  raw(block: string): this {
    this.rawBlocks.push(block.trim());
    return this;
  }

  /** Render the policy to a Rego source string. */
  build(): string {
    const sections: string[] = [`package ${this.packageName}`];

    if (this.imports.length > 0) {
      sections.push(this.imports.map((i) => `import ${i}`).join('\n'));
    }

    if (this.defaults.length > 0) {
      sections.push(
        this.defaults.map((d) => `default ${d.name} := ${regoLiteral(d.value)}`).join('\n'),
      );
    }

    for (const allow of this.allows) {
      sections.push(this.renderBlock('allow if', allow.conditions));
    }

    for (const deny of this.denies) {
      const body = [...deny.conditions, `msg := ${regoLiteral(deny.message)}`];
      sections.push(this.renderBlock('deny contains msg if', body));
    }

    for (const custom of this.customs) {
      sections.push(this.renderBlock(`${custom.name} if`, custom.conditions));
    }

    sections.push(...this.rawBlocks);

    return sections.join('\n\n') + '\n';
  }

  private renderBlock(head: string, conditions: string[]): string {
    const body = conditions.map((c) => `${INDENT}${c}`).join('\n');
    return `${head} {\n${body}\n}`;
  }
}

/** Entry point: start building a Rego policy for the given package. */
export function regoPolicy(packageName: string): RegoPolicyBuilder {
  return new RegoPolicyBuilder(packageName);
}
