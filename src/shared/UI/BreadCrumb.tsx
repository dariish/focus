import React from "react";

export type BreadCrumbItem = {
  title: string;
  onClick?: () => void;
};

export type BreadCrumbProps = {
  items: BreadCrumbItem[];
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  separator?: string | React.ReactNode;
  separatorClassName?: string;
};

export default function BreadCrumb({
  items,
  className = "",
  itemClassName = "",
  activeItemClassName = "",
  separator = "/",
  separatorClassName = "",
}: BreadCrumbProps) {
  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className={`cursor-pointer  ${itemClassName}`}
                >
                  {item.title}
                </button>
              ) : (
                <span
                  className={`${activeItemClassName || itemClassName}`}
                  aria-current="page"
                >
                  {item.title}
                </span>
              )}
              {!isLast && (
                <span className={separatorClassName} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
