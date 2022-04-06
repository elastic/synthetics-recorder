import { getProduct, getRecommendedProducts } from "../";

export default async function handler(req, res) {
  const { productId } = req.query;
  const product = getProduct(productId);
  res.json({ product, recommendations: getRecommendedProducts().slice(0, 4) });
}
