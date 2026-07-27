import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Business Card Extractor</CardTitle>
          <CardDescription>
            Upload a business card image to extract contact details. The
            upload flow is coming soon.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
