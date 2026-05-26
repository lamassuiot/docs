---
name: software-documentation-reviewer
description: Review software documentation for structure, audience fit, navigability, coherence, and actionability. Use when evaluating documentation pages, guides, service descriptions, API/product docs, onboarding docs, or technical reference content. First classify the document type, especially whether it is a task-oriented guide or a service/product description, then check whether the outline, “On this page” structure, level of detail, sequencing, and content coherence help users understand and complete their goal.
---

# Software Documentation Reviewer

## Core Review Principle

Review documentation from the user’s point of view, not only from the writer’s point of view.

Before reviewing wording or details, determine what kind of documentation this is and what job it must perform. A good documentation page should make the user’s next step obvious.

Use HashiCorp Vault-style documentation as an inspiration point: clear navigation, explicit page purpose, strong “On this page” structure, step-by-step guides where appropriate, and organized service/reference pages that avoid being either too generic or too exhaustive.

## Required Workflow

### 1. Identify the documentation type

First classify the page or section as one of these types:

- **Guide / tutorial / how-to**: The user needs to complete a task.
- **Service or product description**: The user needs to understand what something is, what it does, and when to use it.
- **Reference documentation**: The user needs precise details, parameters, options, APIs, commands, configuration, or behavior.
- **Conceptual explanation**: The user needs background understanding before acting.
- **Mixed documentation**: The page combines more than one purpose.

If the type is mixed, say which purpose should be primary and which parts should be moved, split, or reframed.

### 2. Infer the user intent

Identify the most likely reader goal:

- “I want to do X.”
- “I want to understand what X is.”
- “I want to decide whether X is relevant to me.”
- “I want to configure/integrate/use X correctly.”
- “I want to troubleshoot or verify X.”

Use this inferred goal to judge the page structure.

### 3. Review or propose the outline first

Before reviewing full content, review the current outline or propose a better one.

For each page, check whether the “On this page” outline is useful, ordered, and appropriately detailed.

A good outline should:

- Start with the page goal or overview.
- Expose the user journey clearly.
- Avoid generic headings like “Introduction”, “Details”, or “More information” unless they are genuinely useful.
- Avoid going too deep into tiny implementation details in the outline.
- Make prerequisites, steps, verification, and next steps easy to find.
- Separate conceptual explanation from procedural steps when needed.

### 4. If it is a guide, prioritize step-by-step flow

For guides, the documentation should guide the user through a task.

Check for:

- Clear goal at the top.
- Prerequisites before steps.
- Required permissions, tools, versions, configuration, or assumptions.
- Numbered steps in the correct order.
- Commands, examples, or UI actions close to the relevant step.
- Expected result after important steps.
- Verification section.
- Troubleshooting or common errors where useful.
- Cleanup or rollback if relevant.
- Next steps after completion.

Recommended guide outline:

```markdown
# [Task-oriented title]

## Overview
## Prerequisites
## Before you begin
## Step 1: [Action]
## Step 2: [Action]
## Step 3: [Action]
## Verify the result
## Troubleshooting
## Next steps
```

Adapt the outline to the page. Do not force unnecessary sections.

### 5. If it describes a service, prioritize organized understanding

For service or product descriptions, the page should help the user understand what the service is, when to use it, and how its parts fit together.

Check for:

- Clear definition in the first paragraph.
- Main use cases.
- Key capabilities.
- Architecture or core components, if relevant.
- How the service interacts with users, systems, or dependencies.
- Configuration or integration entry points.
- Operational considerations.
- Limits, constraints, or security considerations.
- Links to guides and reference pages.

Recommended service description outline:

```markdown
# [Service name]

## Overview
## When to use this service
## Key concepts
## Architecture or main components
## How it works
## Configuration
## Security and permissions
## Operational considerations
## Related guides
## Reference
```

Keep the level of detail balanced. The page should not become an implementation dump, but it should contain enough concrete detail to be useful.

### 6. If it is reference documentation, prioritize precision and scanability

For reference pages, check for:

- Complete parameter, command, API, option, or field descriptions.
- Defaults, accepted values, required/optional status, and examples.
- Consistent formatting.
- Tables where they improve scanning.
- Warnings for destructive, security-sensitive, or irreversible behavior.
- Links to conceptual and guide pages.

Reference content should be concise but not vague.

### 7. Review content coherence after the outline is right

Only after the structure is clear, review the body content.

Check:

- Does each section deliver what its heading promises?
- Are concepts introduced before they are used?
- Are steps actionable without hidden assumptions?
- Are examples realistic and aligned with the surrounding text?
- Are terms used consistently?
- Are links placed where the user needs them?
- Are repeated explanations consolidated?
- Is anything missing for the user to succeed?
- Is anything too detailed for this page and better moved to reference docs?
- Is anything too generic and needs a concrete example?

### 8. Judge level of detail

Flag content as:

- **Too generic**: It states obvious benefits or concepts without helping the user act or decide.
- **Too deep**: It includes low-level implementation details that interrupt the main user journey.
- **Appropriate**: It gives enough context, examples, and constraints for the page type.

When something is too generic, suggest a concrete replacement.
When something is too deep, suggest moving it to a reference, advanced section, appendix, or linked page.

## Output Format

Use this structure unless the user asks for something else:

```markdown
## Documentation type

[Guide / service description / reference / concept / mixed]

## Likely user goal

[One or two sentences]

## Outline review

### Current outline assessment
[Brief assessment]

### Recommended “On this page” outline
1. [Section]
2. [Section]
3. [Section]

## Content and coherence review

### What works
- [Strength]

### Main issues
- [Issue + why it matters]

### Recommended changes
- [Specific change]

## Section-by-section notes

### [Section name]
- [Keep / revise / move / split]
- [Concrete recommendation]

## Final verdict

[Concise summary of whether the documentation is ready, needs restructuring, or needs deeper content work.]
```

## Review Style

Be direct, practical, and specific.

Do not only say “add more detail” or “improve clarity.” Explain what detail is missing, where it should go, and why.

Prefer actionable rewrites and proposed headings over abstract feedback.

When proposing an outline, use the documentation’s actual topic and user goal rather than generic template wording.

## Special Rules

- Do not start with copyediting unless the structure is already good.
- Do not optimize for completeness at the expense of usability.
- Do not treat every page as a guide. Some pages should be service descriptions, references, or conceptual explanations.
- If the page mixes guide and reference content, recommend splitting or clearly separating them.
- If the “On this page” outline is weak, fix that before reviewing paragraphs.
- If important context is missing, state the assumption you are making and continue with the best possible review.