export default function SideSectionMid({
  containerClassName,
  bottomBorder = false,
  children,
}: {
  containerClassName?: string;
  bottomBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col bg-main-600 border-x border-stroke-500 p-4 ${
        bottomBorder ? "border-b rounded-b" : ""
      } ${containerClassName}`}
    >
      {children}
    </div>
  );
}
