import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2800}
      newestOnTop
      theme="light"
      toastClassName="rounded-xl font-poppins text-sm shadow-soft"
      progressClassName="bg-primary"
    />
  );
}
