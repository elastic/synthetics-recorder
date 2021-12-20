import React from "react";
import Price from "../components/Price";

const Product = (prop) => {
  return (
    <div className="col-md-4">
      <div className="card mb-4 box-shadow">
        <a href={"/product/" + prop.id}>
          <img
            className="card-img-top"
            alt={prop.description}
            src={prop.picture}
          />
        </a>
        <div className="card-body">
          <h5 className="card-title">{prop.name}</h5>
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <a href={"/product/" + prop.id}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Buy
                </button>
              </a>
            </div>
            <Price data={prop} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
