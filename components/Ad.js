import React from "react";

const Ad = ({ data }) => (
  <div className="container">
    <div className="alert alert-dark" role="alert">
      <strong>Advertisement: </strong>
      <a
        href={data.redirect_url}
        rel="nofollow"
        target="_blank"
        className="alert-link"
      >
        {data.text}
      </a>
    </div>
  </div>
);

export default Ad;
