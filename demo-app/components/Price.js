import React from "react";

export const renderPrice = (data, key = "price_usd") => {
  const value = data[key];
  const price = `${value.units}.${value.nanos || 0}`;
  return value.currency_code + " " + Number(price).toFixed(2);
};

export const renderTotalCost = (items) => {
  const price = items.reduce((acc, { price_usd, quantity }) => {
    const value = `${price_usd.units}.${price_usd.nanos || 0}`;
    return acc + Number(value) * Number(quantity);
  }, 0);

  return price.toFixed(2);
};

export const getShippingCost = () => (Math.random() * 4 + 3).toFixed(2);

export const TotalPrice = ({ items }) => (
  <div className="row pt-2 my-3">
    <div className="col text-center">
      Total Cost: <strong>USD {renderTotalCost(items)}</strong>
    </div>
  </div>
);

const Price = ({ data }) => <p className="text-muted">{renderPrice(data)}</p>;
export default Price;
