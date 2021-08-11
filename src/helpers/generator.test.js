const { generateIR } = require("./generator");

const actions = [
  {
    pageAlias: "page",
    isMainFrame: true,
    frameUrl: "about:blank",
    committed: true,
    action: {
      name: "openPage",
      url: "about:blank",
      signals: [],
    },
  },
  {
    pageAlias: "page",
    isMainFrame: true,
    frameUrl: "https://vigneshh.in/",
    committed: true,
    action: {
      name: "navigate",
      url: "https://vigneshh.in/",
      signals: [],
    },
  },
  {
    pageAlias: "page",
    isMainFrame: true,
    frameUrl: "https://vigneshh.in/",
    action: {
      name: "click",
      selector: "text=I Enjoy evangelizing the magic of web performance.",
      signals: [],
      button: "left",
      modifiers: 0,
      clickCount: 1,
    },
    committed: true,
  },
  {
    pageAlias: "page",
    isMainFrame: true,
    frameUrl: "https://vigneshh.in/",
    action: {
      name: "click",
      selector: "text=Babel Minify",
      signals: [
        {
          name: "popup",
          popupAlias: "page1",
          isAsync: true,
        },
      ],
      button: "left",
      modifiers: 0,
      clickCount: 1,
    },
    committed: true,
  },
  {
    pageAlias: "page1",
    isMainFrame: true,
    frameUrl: "https://github.com/babel/minify",
    action: {
      name: "click",
      selector: 'a:has-text("smoke")',
      signals: [
        {
          name: "navigation",
          url: "https://github.com/babel/minify",
        },
        {
          name: "navigation",
          url: "https://github.com/babel/minify/tree/master/smoke",
        },
        {
          name: "navigation",
          url: "https://github.com/babel/minify/tree/master/smoke",
          isAsync: true,
        },
        {
          name: "navigation",
          url: "https://github.com/babel/minify",
          isAsync: true,
        },
      ],
      button: "left",
      modifiers: 0,
      clickCount: 1,
    },
  },
  {
    pageAlias: "page1",
    isMainFrame: true,
    frameUrl: "https://github.com/babel/minify",
    committed: true,
    action: {
      name: "closePage",
      signals: [],
    },
  },
  {
    pageAlias: "page",
    isMainFrame: true,
    frameUrl: "https://vigneshh.in/",
    committed: true,
    action: {
      name: "closePage",
      signals: [],
    },
  },
];

console.log(generateIR(actions));
