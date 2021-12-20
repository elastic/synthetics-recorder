import React from "react";
import Head from "next/head";
import Link from "next/link";
import Cookies from "js-cookie";

const Header = ({}) => {
  if (!Cookies.get("session_id") && global.window) {
    Cookies.set("session_id", performance.now() + "-" + Date.now());
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
        />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <title>Hipster Shop</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.1/dist/css/bootstrap.css"
          integrity="sha256-KeWggbCyRNU5k8MgZ7Jf8akh/OtL7Qu/YloCBpayj40="
          crossOrigin="anonymous"
        />
      </Head>
      <header>
        <div className="navbar navbar-dark bg-dark box-shadow">
          <div className="container d-flex justify-content-between">
            <a href="/" className="navbar-brand d-flex align-items-center">
              Hipster Shop
            </a>
            <form
              className="form-inline ml-auto"
              method="POST"
              action="/currency"
              id="currency_form"
            >
              <select name="currency_code" className="form-control">
                <option value="USD">USD</option>
              </select>
              <Link href="/cart">
                <a className="btn btn-primary btn-light ml-2" role="button">
                  View Cart
                </a>
              </Link>
            </form>
          </div>
          <style jsx>{`
            .form-control {
              width: auto;
            }
          `}</style>
        </div>
      </header>
    </>
  );
};

export default Header;
