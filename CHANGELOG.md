# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.12.0] - 2025-10-22

- Add new rule `no-trailing-zero` that flags and fixes unnecessary trailing zeros in numeric values
- Handles various CSS units, negative numbers, and decimal values
- Preserves non-trailing zeros in numbers like 11.01rem and 2.05em
- Includes comprehensive test coverage for edge cases

## [1.11.1] - 2025-10-15

- Improve README structure and clarity
  - Add "Important: Only Enable One Ordering Rule at a Time" section after configuration options
  - Clarify that both `extends` and `plugins` approaches support rule customization
  - Update "Recommended Configuration" section to list all 6 available rules (4 enabled by default, 2 alternatives)
  - Add clear examples for switching between ordering rules
- Add warning about conflicting auto-fixes when multiple ordering rules are enabled simultaneously
- Clarify that users must explicitly disable the default ordering rule when switching to a different one

## [1.11.0] - 2025-06-25

- add reference tracking for wrapper functions in vanilla-extract style objects
- implement ReferenceTracker class for detecting vanilla-extract imports
- add createReferenceBasedNodeVisitors for automatic function detection
- support wrapper functions with parameter mapping enable all lint rules to work with custom wrapper functions

## [1.10.0] - 2025-04-19

- confirm compatibility with ESLint 8.57.0
- add support for ESLint v9 extends field in flat config
- maintain backward compatibility with existing usage patterns
- update [README.md](README.md#usage) with configuration examples for both ESLint 8 and ESLint 9

## [1.9.0] - 2025-04-16

- add new rule `no-unknown-unit` that disallows unknown or invalid CSS units in vanilla-extract style objects.
  - Reports any usage of unrecognized units in property values
  - Handles all vanilla-extract APIs, including style, recipe, fontFace, and keyframes
  - Ignores valid units in special contexts (e.g., CSS functions, custom properties)
  - Supports nested objects, media queries, and pseudo-selectors
  - No autofix is provided because replacing or removing unknown units may result in unintended or invalid CSS; manual
    developer review is required

## [1.8.0] - 2025-04-12

- add new rule `no-zero-unit` that enforces unitless zero values in vanilla-extract style objects
  - Automatically removes unnecessary units from zero values (e.g., '0px' → '0')
  - Handles both positive and negative zero values
  - Preserves units where required (time properties, CSS functions)
  - Works with all vanilla-extract APIs including style, recipe, fontFace, and keyframes
  - Supports nested objects, media queries, and pseudo-selectors

## [1.7.0] - 2025-04-07

- add a recommended configuration preset that enables concentric-order and no-empty-style-blocks rules with error
  severity.
  - Fix plugin configuration structure to work properly
  - Set concentric-order and no-empty-style-blocks as recommended rules
  - Use error severity for recommended rules to enforce best practices
  - Maintain backward compatibility with existing implementations

## [1.6.0] - 2025-04-06

- add new rule `no-empty-style-blocks` that detects and disallows empty style objects in vanilla-extract style functions
  - Identifies empty objects in style, styleVariants, recipe, globalStyle and other API functions
  - Handles nested empty selectors, media queries, and conditional styles
  - Provides auto-fix capability to remove unnecessary empty blocks
  - Special handling for recipe objects with empty base and variants

## [1.5.3] - 2025-03-12

- Add bug and feature request templates

## [1.5.2] - 2025-03-12

- Add CODEOWNERS file to enforce code review requirements

## [1.5.1] - 2025-03-12

- Update project dependencies to latest versions

## [1.5.0] - 2025-03-12

- Fix handling of missing groupOrder configuration
- Refactor negative conditions to positive ones with optional chaining
- Add comprehensive tests to achieve total coverage

## [1.4.7] - 2025-03-10

- Exclude test directories from published package

## [1.4.6] - 2025-03-10

- Add demo gif to README

## [1.4.5] - 2025-03-10

- Add GitHub Actions workflow for linting and testing

## [1.4.4] - 2025-03-10

- Improve GitHub Actions workflow for release creation

## [1.4.3] - 2025-03-10

- Add coverage for shared utility functions

## [1.4.2] - 2025-03-09

- Add GitHub Action to create releases from tags

## [1.4.1] - 2025-03-09

- Add comprehensive test suite for CSS ordering rules

## [1.4.0] - 2025-03-08

- Implement special ordering for fontFace APIs

## [1.3.1] - 2025-03-07

- Update milestones

## [1.3.0] - 2025-03-06

- Add script for versioning updates

## [1.2.0] - 2025-03-05

- Add support for linting keyframes and globalKeyframes

## [1.1.2] - 2025-03-05

- add .npmignore to exclude development files from npm package

## [1.1.1] - 2025-03-05

- Improve packaging and TypeScript configuration

## [1.1.0] - 2025-03-04

- Lower minimum Node.js version to 18.18.0

## [1.0.2] - 2025-03-04

- Add npm version badge and link to vanilla-extract

## [1.0.1] - 2025-03-04

- Add sample CSS file for linting demo during development

## [1.0.0] - 2025-03-04

- Initialize project with complete codebase
