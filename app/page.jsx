import CoverPreview from "@/components/shared/CoverPreview";
import CoverSelector from "@/components/shared/CoverSelector";
import Image from "next/image";

export default function Home() {
  return (
    <div className="p-4">
      {/* <CoverPreview /> */}

      <h1 className="text-xl font-medium">Lego Album Covers</h1>
      <CoverSelector />
      {/* <CoverPreview /> */}
    </div>
  );
}
