# Clockify Reminder

A desktop application that reminds you to submit your timesheet in Clockify.

## Features

- Reminds you to submit your time entries for approval in Clockify
- Shows approval status for previous time periods
- Automatically checks status on a configurable schedule
- Runs in the background with system tray/menu bar integration

## Development

### Prerequisites

- Node.js (version 22 or higher)
- npm package manager

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/gableroux/clockify-reminder.git
   cd clockify-reminder
   ```

2. Install dependencies
   ```bash
   npm ci
   ```

3. Start the development server
   ```bash
   npm start
   ```

### Building

To build the application for distribution:

```bash
# Package the app
npm run package

# Create distributable installers
npm run make
```

### Testing

The project uses Jest for testing. For more details, see [TESTING.md](TESTING.md).

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Configuration

The application can be configured using environment variables:

- `REFRESH_INTERVAL_SECONDS`: Time between status checks in seconds (default: 360)
- `VALIDATION_DAY`: Day of the week to remind users (0 = Sunday, 1 = Monday, etc., default: 1)
- `CUSTOM_START_DATE`: Custom start date for timesheet periods (default: Sunday before last)

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
