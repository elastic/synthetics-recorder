import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Recommendations from "../../components/Recommendations";
import { renderTotalCost, getShippingCost } from "../../components/Price";
import * as storage from "../../utils/storage";

const Checkout = ({}) => {
  const NoOrders = () => (
    <>
      <Header />
      <main role="main">
        <div className="py-5">
          <div className="container bg-light py-3 px-lg-5">
            <>
              <h3>No orders found</h3>
            </>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  if (!global.window) {
    return <NoOrders />;
  }
  const orderDetails = storage.get("order");
  if (!orderDetails) {
    return <NoOrders />;
  }
  // clear order
  storage.del("order");
  const { order_id, tracking_id, items, recommendations } = orderDetails;

  let Rendered = null;
  if (items && items.length > 0) {
    Rendered = () => (
      <>
        <div className="row mt-5 py-2">
          <div className="col">
            <h3>Your order is complete!</h3>
            <p>
              Order Confirmation ID: <strong>{order_id}</strong>
              <br />
              Shipping Tracking ID: <strong>{tracking_id}</strong>
            </p>
            <p>
              Shipping Cost: <strong>{getShippingCost()}</strong>
              <br />
              Total Paid: <strong>USD {renderTotalCost(items)}</strong>
            </p>
            <a className="btn btn-primary" href="/" role="button">
              Browse other products &rarr;{" "}
            </a>
          </div>
        </div>
      </>
    );
  } else {
    Rendered = <NoOrders />;
  }

  return (
    <>
      <Header />
      <main role="main">
        <div className="py-5">
          <div className="container bg-light py-3 px-lg-5">
            <Rendered />
            <hr />
            {recommendations && recommendations.length > 0 && (
              <Recommendations recommendations={recommendations} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
