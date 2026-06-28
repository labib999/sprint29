# Sprint29 Development Guide

This document defines how Sprint29 should be developed.

It applies to both human developers and AI coding assistants.

---

# General Rules

Build one sprint at a time.

Never implement future sprint features.

Always keep the application deployable.

Prefer readability over cleverness.

---

# Coding Principles

Follow Feature-Based Architecture.

Keep business logic separate from UI.

Use services for database access.

Keep AI isolated inside its own feature.

Reuse components whenever possible.

---

# AI Development Rules

AI is an assistant.

Never allow AI to automatically modify user data.

AI only provides recommendations.

Users always make final decisions.

All prompts should live inside a dedicated prompts folder.

Never place prompt text directly inside React components.

---

# Documentation Rules

After every sprint

Update

README

ROADMAP

ARCHITECTURE

Record important decisions when needed.

---

# Refactoring Rules

At the end of every sprint

Remove duplicate code.

Rename unclear variables.

Simplify components.

Split large files.

Improve folder organization if necessary.

---

# Deployment Checklist

Before merging

Application builds successfully.

Lint passes.

No console errors.

Deployment succeeds.

Documentation updated.

---

# Project Philosophy

Sprint29 should remain

Simple

Minimal

Readable

Maintainable

Scalable

The goal is not to build the biggest productivity application.

The goal is to build a clean product that can evolve through continuous improvement.

## AI Development Philosophy

Sprint29 is developed using AI-assisted coding.

The AI should act as a professional software engineer.

Do not over-engineer.

Only implement features required for the current sprint.

Keep generated code readable.

Favor clarity over cleverness.

Always explain important architectural decisions in comments when appropriate.

Never introduce unnecessary libraries or patterns.