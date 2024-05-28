# MR Editor

This is a webapp that allows you to edit the items available to the Quest application.
It allows you to add, edit, and delete items from the database.

## Usage

To use this app, you must have the following installed:

- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)

To run the app, navigate to the root directory of the project and run the following commands:

```bash
npm install
npm run init-db
npm start
```

This will start the app on `localhost:3080`.

If you want to change the port, you can do so by setting the `PORT` environment variable before running the app,
either on the command line or in a `.env` file. For example, to run the app on port 3000, you can run the following commands:

```bash
export PORT=3000
npm start
```

or

```bash
echo "PORT=3000" > .env
npm start
```
