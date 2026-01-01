"use server";
import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});


export async function POST(req: Request) {
  try {
    const { msg, collectionName } = await req.json();
    // console.log("Message is: ", msg, collectionName);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        taskType: TaskType.RETRIEVAL_DOCUMENT
    })

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANTDB_URL,
        apiKey: process.env.QDRANTDB_API_KEY,
        collectionName: collectionName
    })

    const vectorRetriver = vectorStore.asRetriever({
        k: 3
    })

    const relevantChunks = await vectorRetriver.invoke(msg);

    // console.log(relevantChunks)

    const SYSTEM_PROMPT = `You are an AI assistant that answers questions based on the provided context available to you from a file with the content and page number.
  Only answer based on the available context from file and also give page Number.
  
  Context:
  ${JSON.stringify(relevantChunks)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: msg,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      thinkingConfig: {
        thinkingBudget: 400
      },
      maxOutputTokens: 1024,
      temperature: 0.7
    }
  });

  const result = response.text;
  // console.log("Result of RAG is: ", result);

  return NextResponse.json({message: "Success", data: result, status: true});
} catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        status: false,
      },
      { status: 500 }
    );
  }
}
