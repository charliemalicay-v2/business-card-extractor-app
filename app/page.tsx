import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Business Card Extractor</CardTitle>
          <CardDescription>
            Upload a business card image to extract contact details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadDropzone />
        </CardContent>
      </Card>
    </div>
  );
}
