import dotenv from "dotenv";
dotenv.config();

import { Document, VectorStoreIndex } from "llamaindex";

const documents = [
  new Document({
    text: "this stores opens at 6am and closes at 10pm",
    metadata: {
        openStores: [
            "Nike",
            "Adidas",
            "Puma"
        ]
    },
  }),
  new Document({
    text: "this store opens at 10pm and closes at 6am",
    metadata: {
        openStores: [
            "Balenziaga",
            "Gucci",
        ]
    },
  }),
];

const index = await VectorStoreIndex.fromDocuments(documents);
const retriever = index.asRetriever();
retriever.similarityTopK = 1;

export async function getOpenStores (query: string) {
  console.log("Looking for which store is open", query);
  const matchingNodes = await retriever.retrieve(query);
  const found = matchingNodes[0];
  console.log("Found", found);
  return found.node.metadata.openStores;
}

await getOpenStores("Which store is open at 8am?");