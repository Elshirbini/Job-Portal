import { Type } from "@google/genai";
import { z } from "zod";

export const getOrderStatusSchema = z.object({
  orderId: z.string().trim().min(1).max(50),
});

export const getOrderStatusDeclaration = {
  name: "getOrderStatus",
  description: "Get the current status of a specific order using its order ID.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: "The order ID provided by the user",
      },
    },
    required: ["orderId"],
  },
};
