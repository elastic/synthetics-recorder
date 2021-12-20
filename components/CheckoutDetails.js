import Cookies from "js-cookie";
import React from "react";
import { Form, Field } from "react-final-form";
import * as storage from "../utils/storage";

const onSubmit = async () => {
  const sessionId = Cookies.get("session_id");
  const response = await fetch(`/api/cart/checkout`, {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(storage.get(sessionId)),
  });
  const data = await response.json();
  storage.set("order", data);
  // clear items in cart
  storage.del(sessionId);
  window.location.replace("/cart/checkout");
};

const CheckoutDetails = ({}) => (
  <div className="row py-3 my-2">
    <div className="col-12 col-lg-8 offset-lg-2">
      <h3>Checkout</h3>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="col-md-5 mb-3">
                <label htmlFor="email">E-mail Address</label>
                <Field
                  component="input"
                  name="email"
                  defaultValue="someone@example.com"
                  className="form-control"
                  type="email"
                ></Field>
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="street_address">Street Address</label>
                <Field
                  component="input"
                  name="street_address"
                  defaultValue="1600 Amphitheatre Parkway"
                  className="form-control"
                  type="text"
                />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="zip_code">Zip Code</label>
                <Field
                  component="input"
                  name="zip_code"
                  defaultValue="1600 Amphitheatre Parkway"
                  className="form-control"
                  defaultValue="94043"
                  type="text"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="col-md-5 mb-3">
                <label htmlFor="city">City</label>
                <Field
                  component="input"
                  name="city"
                  defaultValue="Mountain View"
                  className="form-control"
                  type="text"
                />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="state">State</label>
                <Field
                  component="input"
                  name="state"
                  defaultValue="CA"
                  className="form-control"
                  type="text"
                />
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="country">Country</label>
                <Field
                  component="input"
                  name="country"
                  defaultValue="United States"
                  className="form-control"
                  type="text"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="col-md-6 mb-3">
                <label htmlFor="credit_card_number">Credit Card Number</label>
                <Field
                  component="input"
                  name="credit_card_number"
                  defaultValue="4432-8015-6152-0454"
                  className="form-control"
                  type="text"
                />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="credit_card_expiration_month">Month</label>
                <Field
                  component="select"
                  name="credit_card_expiration_month"
                  className="form-control"
                  defaultValue="1"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </Field>
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="credit_card_expiration_year">Year</label>
                <Field
                  component="select"
                  name="credit_card_expiration_year"
                  className="form-control"
                  defaultValue="2021"
                >
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                </Field>
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="credit_card_cvv">CVV</label>
                <Field
                  component="input"
                  type="password"
                  className="form-control"
                  name="credit_card_cvv"
                  defaultValue="672"
                  autoComplete="off"
                  pattern="\d{3}"
                ></Field>
              </div>
            </div>
            <div className="form-row">
              <button className="btn btn-primary" type="submit">
                Place your order &rarr;
              </button>
            </div>
          </form>
        )}
      />
    </div>
  </div>
);

export default CheckoutDetails;
