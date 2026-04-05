import { AIToolLayout } from "@/components/AIToolLayout";
import { ImageDetectorClient } from "@/components/ai/ImageDetectorClient";

export default function ImageDetectorPage() {
  return (
    <AIToolLayout
      activeHref="/ai-tools/image-detector"
      title="Image-Based AI Detector"
      description="Upload a microscope image, crop and zoom it, then send the specimen view through a guarded educational vision workflow."
    >
      <ImageDetectorClient />
    </AIToolLayout>
  );
}

