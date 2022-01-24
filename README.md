## Elastic Synthetics Recorder

### Installation and Usage

#### Download and Install

We publish releases of the Script Recorder on its [GitHub repo](https://github.com/elastic/synthetics-recorder/releases).
You can find downloadable installers there for a variety of platforms.

**Note that the Script Recorder is in a Tech Preview phase at the moment, and not supported.**

Download and unpack the appropriate installer for your platform, and install it.

#### Usage

This section describes the basic usage of the Script Recorder.
It explains how to start a journey and record steps, as well as testing and outputting a completed script.

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

**Note:** the recorder is intended to be run against a specific version of `node`/`npm`.
If you use `nvm` to manage your versions, you can simply run `nvm use` to switch to the
appropriate version. If not, you can view the current supported version in the `.nvmrc` file.
You can see potential error outputs as a result of using the incorrect version below in the troubleshooting section.

Install the dependencies

```
npm install
```

Run the recorder app in dev mode.

```
npm run dev
```

#### Possible install issues

If you receive a set of error logs like those listed below, it is likely because your
version of `npm` is higher than `v6`. Later versions of `npm` are stricter about peer
dependency resolution, and thus it will refuse to install.

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: synthetics-recorder@0.0.1-alpha.1
npm ERR! Found: @types/react-dom@17.0.11
npm ERR! node_modules/@types/react-dom
npm ERR!   dev @types/react-dom@"^17.0.10" from the root project
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer @types/react-dom@"^16.9.6" from @elastic/eui@37.7.0
npm ERR! node_modules/@elastic/eui
npm ERR!   @elastic/eui@"^37.0.0" from the root project
npm ERR!
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
```

You can get around this by using `npm` version 6 to install.

### Build

Build and Package the app for all platforms

```
npm run build
```
