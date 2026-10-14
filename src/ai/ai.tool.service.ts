import { injectable } from "tsyringe";
import { getOrderStatusSchema } from "./ai.tools";
import { ApiError } from "../utils/apiError";

@injectable()
export class AIToolService {
  constructor() {}
  async getOrderStatus(args: unknown, userId: string) {
    const { orderId } = getOrderStatusSchema.parse(args);

    // Replace with a database query.
    const orders = [
      {
        id: "ORD-123",
        userId: "user-1",
        status: "shipped",
      },
      {
        id: "ORD-456",
        userId: "user-2",
        status: "delivered",
      },
    ];

    const order = orders.find(
      (item) => item.id === orderId && item.userId === userId,
    );

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    return {
      orderId: order.id,
      status: order.status,
    };
  }
}
