# Clockify Reminder

A desktop application that reminds you to submit your timesheet in Clockify.

## Features

- Reminds you to submit your time entries for approval in Clockify
- Shows approval status for previous time periods
- Automatically checks status on a configurable schedule
- Runs in the background with system tray/menu bar integration

## Development

### Prerequisites

- Node.js (version 14 or higher)
- Yarn package manager

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/gableroux/clockify-reminder.git
   cd clockify-reminder
   ```

2. Install dependencies
   ```bash
   yarn
   ```

3. Start the development server
   ```bash
   yarn start
   ```

### Building

To build the application for distribution:

```bash
# Package the app
yarn package

# Create distributable installers
yarn make
```

### Testing

The project uses Jest for testing. For more details, see [TESTING.md](TESTING.md).

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

## Configuration

The application can be configured using environment variables:

- `REFRESH_INTERVAL_SECONDS`: Time between status checks in seconds (default: 360)
- `VALIDATION_DAY`: Day of the week to remind users (0 = Sunday, 1 = Monday, etc., default: 1)
- `CUSTOM_START_DATE`: Custom start date for timesheet periods (default: Sunday before last)

## License

MIT 