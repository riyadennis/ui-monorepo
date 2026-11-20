/**
 * TypeScript mirror of the pbac REST API models
 * (see internal/policy/definition.go and internal/model/policy.go).
 */

/** Comparison operators supported by a leaf condition. */
export type Op =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'matches'
  | 'exists';

/** A leaf comparison, e.g. `role eq "admin"`. */
export interface LeafNode {
  field: string;
  op: Op;
  /** Omitted for the `exists` op; an array for `in` / `nin`. */
  value?: unknown;
}

/** Composite condition nodes — exactly one form is set per node. */
export interface AllNode {
  all: ConditionNode[];
}
export interface AnyNode {
  any: ConditionNode[];
}
export interface NotNode {
  not: ConditionNode;
}

export type ConditionNode = LeafNode | AllNode | AnyNode | NotNode;

export type Effect = 'allow' | 'deny';
export type DefaultDecision = 'deny' | 'allow';

/** A single decision contribution: an effect gated by a condition tree. */
export interface Rule {
  effect: Effect;
  when: ConditionNode;
}

/** The structured, human-editable source of a policy. */
export interface Definition {
  module: string;
  default?: DefaultDecision;
  rules: Rule[];
}

/** A stored policy as returned by the API. */
export interface Policy {
  id: string;
  name: string;
  description: string;
  module: string;
  /** Structured source; null for legacy raw-Rego policies. */
  definition: Definition | null;
  /** Compiled Rego (read-only, used for evaluation). */
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  definition: Definition;
}

export type UpdatePolicyRequest = CreatePolicyRequest;

export interface EvaluateRequest {
  input: Record<string, unknown>;
  /** Defaults server-side to `data.<module>.allow` when omitted. */
  query?: string;
}

export interface EvaluateResponse {
  result: unknown;
  allow: boolean;
}
