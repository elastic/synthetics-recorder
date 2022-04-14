import React from "react";
import { Form, Field } from "react-final-form";
import useSWR from "swr";
import Cookies from "js-cookie";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Price from "../../components/Price";
import Recommendations from "../../components/Recommendations";
import Ad from "../../components/Ad";
import * as storage from "../../utils/storage";

export async function getServerSideProps({ params }) {
  return {
    props: {
      productId: params.productId,
    },
  };
}

const onSubmit = async (value) => {
  const sessionId = Cookies.get("session_id");
  if (!storage.get(sessionId)) {
    storage.set(sessionId, []);
  }
  const { productId, quantity } = value;
  const items = storage.get(sessionId);
  items.push({ id: productId, quantity });
  storage.set(sessionId, items);
  window.location.replace("/cart");
};

const ProductForm = ({ data }) => (
  <Form
    onSubmit={onSubmit}
    initialValues={{ productId: data.id, quantity: 1 }}
    render={({ handleSubmit, form }) => (
      <form onSubmit={handleSubmit} className="form-inline text-muted">
        <>
          <Field name="productId" component="input" type="hidden" />
        </>
        <div className="input-group">
          <div className="input-group-prepend">
            <label className="input-group-text" htmlFor="quantity">
              Quantity
            </label>
            <Field
              name="quantity"
              component="select"
              className="custom-select form-control form-control-lg"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </Field>
          </div>
          <button type="submit" className="btn btn-info btn-lg ml-3">
            Add to Cart
          </button>
        </div>
      </form>
    )}
  />
);

const Product = ({ productId }) => {
  const { data, error } = useSWR(`/api/product/${productId}`, (url) =>
    fetch(url).then((r) => r.json())
  );
  if (error) return <div>Failed to load products</div>;
  if (!data) return <div>loading products...</div>;

  const { product, recommendations, ads } = data;

  return (
    <>
      <Header />
      <main role="main">
        <div className="py-5">
          <div className="container bg-light py-3 px-lg-5 py-lg-5">
            <div className="row">
              <div className="col-12 col-lg-5">
                <img className="img-fluid border" src={product.picture} />
              </div>
              <div className="col-12 col-lg-7">
                <h2>{product.name}</h2>
                <Price data={product} />
                <hr />
                <h6>Product Description: {product.description}</h6>
                <hr />
                <ProductForm data={product} />
              </div>
            </div>

            {recommendations && recommendations.length > 0 && (
              <Recommendations recommendations={recommendations} />
            )}
            {ads && <Ad data={ads} />}
          </div>
        </div>
        <style jsx>{`
          .img-fluid border {
            width: 100%;
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
};

export default Product;
