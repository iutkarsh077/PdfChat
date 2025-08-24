"use client";
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import axios from "axios";

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setUploadResult(null) // Reset previous result
    }
  }

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadResult(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Correct axios usage - just pass the formData directly
      const res = await axios.post("/api/uploadFile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // console.log(res.data);
      localStorage.setItem("myCollection", res.data.collectionName);
      setUploadResult(`File uploaded successfully: ${res.data.fileName}`);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadResult("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full mx-auto mt-10 border-0 outline-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Upload Your File
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer border-gray-300 hover:border-blue-500 transition"
        >
          <Upload className="w-8 h-8 text-gray-500 mb-2" />
          <span className="text-sm text-gray-500">
            {file ? file.name : "Click to select a file"}
          </span>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf"
          />
        </label>

        {file && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        )}

        {uploadResult && (
          <p className={`text-sm ${uploadResult.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {uploadResult}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default UploadFile