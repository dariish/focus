import React from "react";

export default function SideSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-3 bg-main-700 p-3 rounded border border-stroke-500">
      {children}
    </div>
  );
}
