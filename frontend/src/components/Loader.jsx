export default function Loader({ label = "Cargando..." }) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-10 text-sm text-neutral/55"
      role="status"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      {label}
    </div>
  );
}
