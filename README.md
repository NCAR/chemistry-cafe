# ChemistryCafe

ChemistryCafe is a web application built with React, Vite, and TypeScript. The app uses various libraries and frameworks such as MUI, Axios, and styled-components to provide a seamless and modern user experience. This README provides information about the application and how to run the code locally.

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)
- [Setup](#setup)
- [Scripts](#scripts)
- [Testing](#testing)

## Features

- **Responsive UI**: Utilizes MUI (Material-UI) for a modern, responsive design.
- **State Management**: Implements hooks and context for managing state.
- **API Interaction**: Uses Axios to fetch data from APIs and manage asynchronous requests.
- **Routing**: React Router DOM for client-side routing and navigation.
- **Authentication**: Supports OAuth with Google for user authentication.
- **Testing**: Uses Vitest for unit tests and test coverage.

## Folder Structure

- `coverage/`: Folder for test coverage reports.
- `dist/`: Folder for build outputs.
- `node_modules/`: Folder for dependencies.
- `public/`: Folder for static assets (images, fonts, etc.).
- `src/`: Source code folder, organized as follows:
    - `API/`: Functions for API interaction.
    - `assets/`: Static assets.
    - `webPages/`: Pages and components:
        - `Components/`: Reusable components.
        - `Family/`: Family-related pages/components.
        - `LogIn/`: Login-related pages/components.
        - `RoutingRenders/`: Routing-related components.
        - `Settings/`: Settings-related pages/components.
    - `index.css`: Global CSS styles.
    - `main.tsx`: Entry point for the application.
    - `vite-env.d.ts`: Vite environment TypeScript declarations.
- `test/`: Folder for test files.
- `.eslintrc.cjs`: ESLint configuration file.
- `.gitignore`: Git ignore file.
- `index.html`: Main entry HTML file located in the root folder.
- `package-lock.json`: npm package lock file.
- `package.json`: npm package metadata file.
- `README.md`: This documentation file.
- `tsconfig.json`: TypeScript configuration file.
- `tsconfig.node.json`: Node.js-specific TypeScript configuration.
- `vite.config.ts`: Vite configuration file.
- `vitest.config.ts`: Vitest configuration file.
- `vitest.setup.ts`: Vitest setup file.

## Dependencies

- **@emotion/react & @emotion/styled**: For styling components.
- **@mui/icons-material & @mui/material**: Material-UI components and icons.
- **@mui/x-data-grid & @mui/x-tree-view**: Advanced Material-UI components.
- **@react-oauth/google**: Google OAuth for authentication.
- **Axios**: HTTP client for API requests.
- **Bootstrap & React Bootstrap**: For styling and UI components.
- **React & React DOM**: JavaScript library and DOM support.
- **React Router DOM**: Client-side routing.
- **Styled-Components**: Another styling library.

## Setup

1. **Clone the repository**:
    ```shell
    git clone https://github.com/NCAR/chemistrycafe.git
    cd chemistrycafe
    ```

2. **Install dependencies**:
    ```shell
    npm install
    ```

3. **Start the development server**:
    ```shell
    npm run dev
    ```

4. The app will run on [http://localhost:5173](http://localhost:5173). You can view it in your browser.

## Scripts

- `npm run dev`: Starts the development server with Vite.
- `npm run build`: Builds the project for production.
- `npm run preview`: Previews the built application.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run test`: Runs unit tests using Vitest.
- `npm run test:coverage`: Runs tests and provides a coverage report.

## Testing

This project uses Vitest for running unit tests and generating coverage reports.

To run the tests, use the following command:

```shell
npm run test
```

To generate a coverage report, use the following command:

```shell
npm run test:coverage
```


