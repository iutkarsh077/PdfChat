import MyChat from "@/components/custom/Chat"
import UploadFile from "@/components/custom/Upload"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="w-80 flex-shrink-0 border-r-2 border-gray-300 flex items-center">
          <UploadFile />
        </div>
        <div className="flex-1">
          <MyChat />
        </div>
      </div>
    </div>
  )
}