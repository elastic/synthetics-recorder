## Elastic Synthetics Recorder

### Installation and Usage

#### Download and Install

We publish releases of the Script Recorder on its [GitHub repo](https://github.com/elastic/synthetics-recorder/releases).
You can find binaries there for all supported platforms.

Download and unpack the appropriate binary for your platform, and install it.

#### Usage

After starting up the application, you may input a URL.
This URL will be the starting point of the journey script Elastic Synthetics will create.

Once you start a journey, Elastic Synthetics will record actions based on your interaction with the browser window.
This includes clicking on text, navigation, focusing on inputs like buttons and text fields, and more.
As you complete your journey, you will see the actions you are generating populate in the Script Recorder's window.

You can also add assertions to your journey.
Use these to make determinations about the state of the page you are testing.
Assertions can include checks for things like the visibility of an element, or the contents of a text field.

The Script Recorder also includes a Pause feature.
When you pause the recording session, you may click around the browser window without recording any actions.
Un-pause the Recorder to continue recording journey actions.

At any point during or after the recording process concludes, you may test your script.
When you click the `Test` button, Elastic Synthetics will run the journey you have defined.
After the test concludes, the Recorder will display results on a per-step basis.

When you are satisfied with the script you have generated, you can save it to file using the `Export script` button.
Additionally, you can display the generated JavaScript code using the `Show script` feature.

### Develop

Install the dependencies

```
npm install
```

Run the recorder app in dev mode.

```
npm run dev
```

### Build

Build and Package the app for all platforms

```
npm run build
```
