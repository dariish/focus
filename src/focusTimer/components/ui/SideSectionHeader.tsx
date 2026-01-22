import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

type ValidHTMLElement =
  | "div"
  | "ul"
  | "ol"
  | "section"
  | "article"
  | "nav"
  | "aside"
  | "header"
  | "footer"
  | "main";

export default function SideSectionHeader({
  showContainerProp = false,
  title,
  content = null,
  containerClassName,
  titleClassName,
  iconClassName,
  children,
  as = "div",
}: {
  showContainerProp?: boolean;
  title: React.ReactNode | string;
  content?: React.ReactNode;
  containerClassName?: string;
  titleClassName?: string;
  iconClassName?: string;
  children: React.ReactNode;
  as?: ValidHTMLElement;
}) {
  const [showContainer, setShowContainer] = useState(showContainerProp);

  const MotionComponent = (motion as any)[as] as typeof motion.div;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        onClick={() => setShowContainer((prev) => !prev)}
        className={`group bg-main-650 hover:bg-main-700 duration-200  border-x border-stroke-500 p-3 flex items-center justify-between transition-colors cursor-default ${
          showContainer ? "rounded-t border-t" : "rounded border"
        } ${containerClassName}`}
      >
        {typeof title === "string" ? (
          <span className={`text-tertiary-500 text-sm ${titleClassName}`}>
            {title}
          </span>
        ) : (
          title
        )}

        <div
          className={`flex items-center text-tertiary-400 text-sm font-light ${
            content ? "gap-2" : "ml-auto"
          }`}
        >
          {content}
          <IoIosArrowForward
            className={`ml-auto group-hover:scale-110 duration-250 fill-tertiary-500   ${
              showContainer ? "rotate-270" : "rotate-90"
            } ${iconClassName}`}
          />
        </div>
      </div>
      <AnimatePresence>
        {showContainer && (
          <MotionComponent
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden flex flex-col gap-0.5"
          >
            {children}
          </MotionComponent>
        )}
      </AnimatePresence>
    </div>
  );
}
