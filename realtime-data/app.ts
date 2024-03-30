import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { getProductId } from "./lib/get-product-id";
import { getOpenStores } from "./lib/get-open-hours";

const openai = new OpenAI();

const functions: any = {
  async recommendProduct(obj: { description: string }) {
    console.log("Recommend product function called by OpenAI", obj.description);
    const productId = await getProductId(obj.description);

    return {
      url: `https://example.com/products/${productId}`
    }
  },
  async openStore(obj: { description: string }) {
    console.log("Open store function called by OpenAI", obj.description);
    const openStores = await getOpenStores(obj.description);

    return {
      stores: openStores
    }
  }
};

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  temperature: 0,
  messages: [
    {
      role: "system",
      content: "You are a helpful assistant that recommends products to users and help them to find which store is open.",
    },
    {
      role: "user",
      content: "Which store is open at 8am?",
    }
  ],
  functions: [
    {
      name: "recommendProduct",
      description: "Takes a short description and returns a recommended product",
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "A short description of the product the user is looking for, ideally a copy paste from the user's mesage"
          }
        }
      }
    },
    {
      name: "openStore",
      description: "Take the time and return the stores that are open at that time",
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "Return the stores that are open at the time the user is asking for, ideally a copy paste from the user's message"
          }
        }
      }
    }
  ]
});

console.log(response.choices[0]);

const function_call = response.choices[0].message.function_call;

if (function_call) {
  const fn = functions[function_call.name];
  const args = JSON.parse(function_call.arguments);
  const result = await fn(args);
  console.log("result", result);
}