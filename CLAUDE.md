# Claude Code Instructions

## Tool Preferences
- Use `fd` instead of `find` for file searching
- Use `tree` for directory structure visualization

## Code Quality Checks
- Run `yarn lint` to check for linting issues
- TypeScript strict mode is enabled - ensure all code is properly typed

## Project Architecture
- TypeScript definitions in `app/types/`
- Composables in `app/composables/`
- Utilities in `app/utils/`
- All external data must be validated using validation utilities
- Avoid optional types unless truly necessary - use explicit defaults instead