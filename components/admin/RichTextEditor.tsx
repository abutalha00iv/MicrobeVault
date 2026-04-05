"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="skeleton h-56 rounded-[1.5rem]" />
}) as any;

export function RichTextEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-2">
      <ReactQuill value={value} onChange={onChange} theme="snow" />
    </div>
  );
}

