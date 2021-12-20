import { getProduct, getRecommendedProducts } from "../";

export default async function handler(req, res) {
  const itemsInSession = req.body;
  const recommendations = getRecommendedProducts(null).slice(0, 4);
  if (!itemsInSession) {
    return res.json({
      items: [],
      recommendations,
    });
  }
  const items = itemsInSession.map((item) => ({
    ...getProduct(item.id),
    quantity: item.quantity,
  }));
  res.json({ items, recommendations });
}
