import React from "react";
import Cookies from "js-cookie";

const Footer = () => (
  <>
    <footer className="py-5 px-5">
      <div className="container">
        <p>
          &copy; 2018 Google Inc&nbsp;
          <span className="text-muted">
            <a href="https://github.com/GoogleCloudPlatform/microservices-demo/">
              (Source Code)
            </a>
          </span>
        </p>
        <p>
          <small className="text-muted">
            This website is hosted for demo purposes only. It is not an actual
            shop. This is not an official Google project.
          </small>
        </p>
        <small className="text-muted">
          User Session Id: {Cookies.get("session_id")}
        </small>
      </div>
    </footer>
  </>
);

export default Footer;
