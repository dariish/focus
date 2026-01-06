import React from "react";
import { RiArrowLeftLine } from "react-icons/ri";

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
  onBack?: () => void;
  showBackButton?: boolean;
  backButtonClassName?: string;
  backButtonContent?: React.ReactNode;
};

export default function BreadCrumb({
  items,
  className = "",
  itemClassName = "",
  activeItemClassName = "",
  separator = "/",
  separatorClassName = "",
  onBack,
  showBackButton = false,
  backButtonClassName = "",
  backButtonContent,
}: BreadCrumbProps) {
  return (
    <nav className={className} aria-label="Breadcrumb">
      <div className="flex items-center gap-2">
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
        {showBackButton && (
          <button
            onClick={onBack}
            className={`cursor-pointer flex items-center justify-center ml-auto ${backButtonClassName}`}
            aria-label="Go back"
            type="button"
          >
            {backButtonContent || <RiArrowLeftLine />}
          </button>
        )}
      </div>
    </nav>
  );
}
