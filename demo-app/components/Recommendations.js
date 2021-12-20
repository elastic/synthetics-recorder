import React from "react";

const Recommendation = ({ data }) => (
  <div className="col-sm-6 col-md-4 col-lg-3">
    <div className="card mb-3 box-shadow">
      <a href={"/product/" + data.id}>
        <img
          className="card-img-top border-bottom"
          alt={data.description}
          width="100%"
          height="auto"
          src={data.picture}
        />
      </a>
      <div className="card-body text-center py-2">
        <small className="card-title text-muted">{data.name}</small>
      </div>
    </div>
  </div>
);

const Recommendations = ({ recommendations }) => (
  <>
    <hr />
    <h5 className="text-muted">Products you might like</h5>
    <div className="row my-2 py-3">
      {recommendations.map((recommendation, i) => (
        <Recommendation key={i} data={recommendation} />
      ))}
    </div>
  </>
);

export default Recommendations;
