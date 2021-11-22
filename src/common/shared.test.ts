/* eslint-disable import/first */
window.require = require;

import { updateAction } from "./shared";
import { ActionContext } from "./types";

describe("shared", () => {
  describe("updateAction", () => {
    const steps: ActionContext[][] = [
      [
        {
          pageAlias: "page",
          isMainFrame: true,
          frameUrl: "http://localhost:12349/html",
          committed: true,
          action: {
            name: "navigate",
            url: "http://localhost:12349/html",
            signals: [],
          },
          title: "Go to http://localhost:12349/html",
        },
        {
          pageAlias: "page",
          isMainFrame: true,
          frameUrl: "http://localhost:12349/html",
          action: {
            name: "click",
            selector: "text=Hello world A link to google",
            signals: [],
            button: "left",
            modifiers: 0,
            clickCount: 1,
          },
          title: "Click text=Hello world",
        },
        {
          action: {
            name: "assert",
            isAssert: true,
            selector: "text=Hello world",
            command: "innerText",
            value: null,
            signals: [],
          },
          frameUrl: "http://localhost:12349/html",
          modified: false,
          isMainFrame: true,
          pageAlias: "page",
        },
      ],
    ];

    it("updates the action at the specified index", () => {
      const updatedSteps = updateAction(steps, "nextValue", 0, 2);
      expect(updatedSteps).toHaveLength(1);
      expect(updatedSteps[0]).toHaveLength(3);
      expect(JSON.stringify(updatedSteps[0][0])).toEqual(
        JSON.stringify(steps[0][0])
      );
      expect(JSON.stringify(updatedSteps[0][1])).toEqual(
        JSON.stringify(steps[0][1])
      );
      expect(updatedSteps[0][2].action.value).toEqual("nextValue");
    });
  });
});
