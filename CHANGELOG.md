# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-04-07

- add a recommended configuration preset that enables concentric-order and no-empty-style-blocks rules with error severity.
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
