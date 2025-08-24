"use server";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const allowedTypes = ['.pdf'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(filePath, buffer);

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        taskType: TaskType.RETRIEVAL_DOCUMENT
    });

    const myCollectionName = crypto.randomUUID();

    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: process.env.QDRANTDB_URL,
        apiKey: process.env.QDRANTDB_API_KEY,
        collectionName: myCollectionName
    })

    console.log("Indexing complete. Vector store ready to use.", vectorStore);

    fs.unlinkSync(filePath);

    return NextResponse.json(
      { 
        success: true, 
        fileName: fileName,
        filePath: `/uploads/${fileName}`,
        collectionName: myCollectionName,
        fileSize: file.size,
        fileType: file.type
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { 
        message: "Internal Server Error", 
        status: false 
      },
      { status: 500 }
    );
  }
}