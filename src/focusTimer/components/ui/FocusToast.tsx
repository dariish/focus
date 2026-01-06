import { Bounce, ToastContainer } from "react-toastify";

export default function FocusToast() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Bounce}
      toastClassName="!bg-main-300 !text-tertiary-500 !shadow shadow-tertiary-500/30! !rounded-xs border !border-stroke-500/90 !gap-2"
      progressClassName="!bg-contrast-500"
      closeButton={false}
    />
  );
}
