import { ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Gallery</h1>
        <p className="text-[#6B7DB3] text-sm">Your exported carousels</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111631] border border-[#1E2545] flex items-center justify-center">
            <ImageIcon size={28} className="text-[#475280]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-1">No exports yet</p>
            <p className="text-[#475280] text-sm max-w-[240px]">
              Generate and download your first carousel to see it here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
