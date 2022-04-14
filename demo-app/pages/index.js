import React from "react";
import useSWR from "swr";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Product from "../components/Product";

const Home = () => {
  const { data, error } = useSWR("/api/product", (url) =>
    fetch(url).then((r) => r.json())
  );
  if (error) return <div>Failed to load products</div>;
  if (!data) return <div>loading products...</div>;
  return (
    <div>
      <Header />
      <main role="main">
        <section className="jumbotron text-center mb-0">
          <div className="container">
            <h1 className="jumbotron-heading">
              One-stop for Hipster Fashion &amp; Style Online
            </h1>
            <p className="lead text-muted">
              Tired of mainstream fashion ideas, popular trends and societal
              norms? This line of lifestyle products will help you catch up with
              the hipster trend and express your personal style. Start shopping
              hip and vintage items now!
            </p>
          </div>
        </section>

        <div className="py-5 bg-light">
          <div className="container">
            <div className="row">
              {data.map((product, i) => (
                <Product key={i} {...product} />
              ))}
              <style jsx>{`
                .card-img-top {
                  width: 100%;
                  height: auto;
                }
              `}</style>
            </div>
            <div className="row"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
