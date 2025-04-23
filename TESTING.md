# Testing Setup for Clockify Reminder

This document explains the testing setup for the Clockify Reminder application.

## Current Setup

The project uses:
- Jest for running tests
- ts-jest for TypeScript support
- JSDOM for browser environment simulation
- Mock implementations for Electron and browser APIs

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

- Tests are located in `src/__tests__/` directory
- Mock implementations are in `src/__mocks__/`
- Setup files:
  - `jest.setup.ts` - Global Jest setup
  - `src/__tests__/setupTests.ts` - Browser environment setup
  - `jest.config.js` - Jest configuration

## Current Test Coverage

The current test coverage is limited because the application code is not structured to be easily testable. The main modules (`config.ts`, `renderer.ts`, `main.ts`) execute code on import, making them difficult to test directly.

## Improving Testability

To improve testability and code coverage:

1. **Refactor the codebase**:
   - Separate side effects from pure functions
   - Use dependency injection for external services
   - Make modules exportable without executing code on import
   - Create more modular, single-responsibility components

2. **Testing Strategy**:
   - Unit tests for utility functions and business logic
   - Component tests for UI elements
   - Integration tests for key workflows
   - End-to-end tests for critical user journeys

3. **Additional Testing Tools to Consider**:
   - Electron testing utilities (spectron or similar)
   - UI component testing libraries

## Mock Strategy

The current testing approach relies heavily on mocking:
- Electron APIs are mocked to avoid actual Electron dependencies
- Browser APIs like `window.electronAPI` are mocked in the setup files
- DOM manipulation is tested using JSDOM

This approach allows testing code that depends on Electron and browser APIs without running an actual Electron instance, but it limits the scope of what can be tested.

## Next Steps

1. Refactor the application code to improve testability
2. Add more comprehensive tests for key functionality
3. Set up continuous integration to run tests automatically
4. Aim for at least 80% code coverage in critical areas 