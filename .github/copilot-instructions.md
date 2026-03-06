# Guidelines

## Project Overview

This repo contains the code for the Geek Tech Workshop Accounting software. It automatically tracks activity in a connected Starling Bank account, checks eBay and Etsy for financial activity, and generates reports for tax filing.

## Coding Guidelines

- Firebase is used for infrastructure and hosting.
- Firestore is used for the database.
- NodeJs and Typescript are used for all backend services.
- NextJs is used for the frontend.
- Prefer immutable data structures over mutable data structures.
- Prefer functional programming techniques where applicable.
- Prefer map, filter, and reduce over for and while loops.

### Firebase Functions

- All Firebase Functions should be written in TypeScript.
- Use async/await for handling asynchronous operations.
- Function code is kept under the `functions/src` directory.
- Each function should have its own file for better organization e.g., `functions/src/myFunction.ts`.

### Etsy API

- All calls to the Etsy API must include the `x-api-key` header formatted as `keystring:sharedSecret` (the app keystring and shared secret separated by a colon).

### File structure

- The `ui/src` directory contains all source code for the User interface
- Pages are kept in `ui/src/pages`
- Components are kept in `ui/src/components`
- Models are kept in `ui/src/models`
- Business logic, services and other code unrelated to directly displaying to the user are kept in `ui/src/lib`
- Each Page or component should exist in its own file for better organization e.g., `ui/src/components/MyComponent.tsx`.
