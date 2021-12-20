import { getProduct, getRecommendedProducts } from "../";

const ORDER = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
const TRACKING = "xx-xxxxxx-xxyxxx";

const createUniqueId = (str) => {
  return str.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default async function handler(req, res) {
  const itemsInSession = req.body;
  const recommendations = getRecommendedProducts(null).slice(0, 4);

  const order_id = createUniqueId(ORDER);
  const tracking_id = createUniqueId(TRACKING);

  if (!itemsInSession) {
    return res.json({
      items: [],
      order_id,
      tracking_id,
      recommendations,
    });
  }
  const items = itemsInSession.map((item) => ({
    ...getProduct(item.id),
    quantity: item.quantity,
  }));

  res.json({
    items,
    order_id,
    tracking_id,
    recommendations,
  });
}
