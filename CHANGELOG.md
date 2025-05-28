# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2023-06-15

### Fixed

- Fixed issue where all `data-component-content` attributes were showing as `%7B%7D` (URL-encoded empty object)
- Fixed text content extraction for nested elements
- Fixed parent node discovery in AST traversal

### Changed

- Improved content extraction from JSXText, JSXExpressionContainer and nested JSXElement nodes
- Enhanced recursive text extraction from nested elements
- Skip adding `data-component-content` attribute for elements with empty content

## [1.0.0] - 2023-06-01

### Added

- Initial release
- Automatic debug attributes for JSX elements
- Support for React, Preact, and SolidJS
- Three.js and Drei element filtering
- Development mode only by default
- Custom prefix support
- Include/exclude patterns
- Relative/absolute path options
- Debug logging
