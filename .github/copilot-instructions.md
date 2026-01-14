# Guidelines

## Project Overview

This repo contains the code for the Geek Tech Workshop Accounting software. It automatically tracks activity in a connected Starling Bank account, checks eBay and Etsy for financial activity, and generates reports for tax filing.

## Coding Guidelines

- Firebase is used for infrastructure and hosting.
- Firestore is used for the database.
- NodeJs and Typescript (ES6 syntax) are used for all backend services.
- React is used for the frontend
- Use the latest compatible versions of all tools and dependencies
- Install all new dependencies using npm
- Prefer immutable data structures over mutable data structures.
- Prefer functional programming techniques where applicable.
- Prefer map, filter, and reduce over for and while loops.

### Firebase Functions

- All Firebase Functions should be written in TypeScript.
- Use async/await for handling asynchronous operations.
- Function code is kept under the `functions/src` directory.
- Each function should have its own file for better organization e.g., `functions/src/myFunction.ts`.
