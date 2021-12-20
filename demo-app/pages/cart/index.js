import React from "react";
import { Form } from "react-final-form";
import useSWR from "swr";
import Cookies from "js-cookie";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Price, { TotalPrice } from "../../components/Price";
import CheckoutDetails from "../../components/CheckoutDetails";
import Recommendations from "../../components/Recommendations";
import * as storage from "../../utils/storage";

const CartForm = () => {
  const onSubmit = () => {
    const sessionId = Cookies.get("session_id");
    storage.del(sessionId);
    window.location.replace("/");
  };

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit}>
          <button className="btn btn-secondary" type="submit">
            Empty cart
          </button>
          <a className="btn btn-info" href="/" role="button">
            Browse more products &rarr;{" "}
          </a>
        </form>
      )}
    />
  );
};

const Cart = () => {
  const sessionId = Cookies.get("session_id");
  const { data, error } = useSWR(`/api/cart`, (url) =>
    fetch(url, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(storage.get(sessionId)),
    }).then((r) => r.json())
  );
  if (error) return <div>Failed to load products</div>;
  if (!data) return <div>loading products...</div>;

  const { items, recommendations } = data;

  let Rendered = null;
  if (items.length === 0) {
    Rendered = () => (
      <>
        <h3>Your shopping cart is empty!</h3>
        <p>Items you add to your shopping cart will appear here.</p>
        <a className="btn btn-primary" href="/" role="button">
          Browse Products &rarr;{" "}
        </a>
        {recommendations.length > 0 && (
          <Recommendations recommendations={recommendations} />
        )}
      </>
    );
  } else {
    Rendered = () => (
      <>
        <div className="row mb-3 py-2">
          <div className="col">
            <h3>{items.length} items in your Shopping Cart</h3>
          </div>
          <div className="col text-right">
            <CartForm />
          </div>
        </div>
        <hr />
        {items.map((item, i) => (
          <div key={i}>
            <div className="row pt-2 mb-2">
              <div className="col text-right">
                <a href={"/product/" + item.id}>
                  <img width="auto" height="60px" src={item.picture} />
                </a>
              </div>
              <div className="col align-middle">
                <strong>{item.name}</strong>
                <br />
                <small className="text-muted">SKU: #{item.id}</small>
              </div>
              <div className="col text-left">
                Qty: {item.quantity}
                <br />
                <strong>
                  <Price data={item} />
                </strong>
              </div>
            </div>
          </div>
        ))}
        <TotalPrice items={items} />
        <hr />
        <CheckoutDetails />
        {recommendations.length > 0 && (
          <Recommendations recommendations={recommendations} />
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <main role="main">
        <div className="py-5">
          <div className="container bg-light py-3 px-lg-5 py-lg-5">
            <Rendered />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
