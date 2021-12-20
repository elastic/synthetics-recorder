import { getProducts } from "../";

export default async function handler(req, res) {
  const products = getProducts();
  res.json(products);
}
