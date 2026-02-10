import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">추억 갤러리</h1>
        <p className="text-muted-foreground">
          우리가 가장 좋아하는 순간과 여행 추천 모음입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PlaceHolderImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="aspect-w-4 aspect-h-3">
                 <Image
                    src={image.imageUrl}
                    alt={image.description}
                    width={600}
                    height={400}
                    data-ai-hint={image.imageHint}
                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                 />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
