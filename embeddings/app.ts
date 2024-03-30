import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import fs from "fs";
import pdf from "@cyber2024/pdf-parse-fixed";
import { Document, TextNode, VectorStoreIndex, serviceContextFromDefaults, storageContextFromDefaults } from "llamaindex";

const buffer = fs.readFileSync("./thesis.pdf");
const parsedPdf = await pdf(buffer);

const serviceContext = serviceContextFromDefaults({
    chunkSize: 4000,
    chunkOverlap: 500,
});

const storageContext = await storageContextFromDefaults({
    persistDir: "./storage"
})

const document = new Document({ text: parsedPdf.text })

const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
    storageContext
});

const query = "Quais tecnologias podem ser usadas para resolver o congestionamento nos aeroportos?"

const retriever = index.asRetriever()

const matchingNodes = await retriever.retrieve(query)

const knowlodge = matchingNodes.map(node => {
    const textNode = node.node as TextNode
    return textNode.text
}).join("\n")

const openai = new OpenAI()
const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
        {
            role: "system",
            content: `Você é um especialista em aeropostos. Aqui está o que você sabe sobre o congestionamento nos aeroportos: \n${knowlodge}`
        },
        {
            role: "user",
            content: query
        }
    ]
})

console.log(response.choices[0])