# Sair (project)

This project uses Electron. Two ways to run it:

1) Electron (the app as intended)

  - Install dependencies:

    npm install

  - Start the Electron app:

    npm start

2) Chromium/Chrome (open the UI in Chrome for testing)

  - Run the launcher added to the project:

    npm run chromium

Notes:

- If `npm start` fails on your machine, ensure Node.js is installed and the working directory is the project folder that contains `package.json`.
- `launch-chromium.js` attempts to find Chrome/Chromium in common Windows install locations and will fall back to the default browser if not found.
- Running `index.html` in Chrome will not provide Electron/Node APIs in the renderer. Use Electron for Node features.
