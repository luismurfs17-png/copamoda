import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Card from "../components/Card";
import InputNumber from "../components/InputNumber";
import { useMeasurements } from "../hooks/useMeasurements";
import { apiError } from "../services/api";
const configured = (() => {
  try {
    return JSON.parse(import.meta.env.VITE_MEASUREMENT_DEFINITIONS || "[]");
  } catch {
    return [];
  }
})();
export default function MeasurementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scope, setScope] = useState("superior");
  const [values, setValues] = useState({});
  const { definitions, saveMeasurement } = useMeasurements(id);
  const fields = useMemo(() => {
    const source = definitions.length ? definitions : configured;
    return source
      .filter((d) => d.scope === scope)
      .sort((a, b) => a.display_order - b.display_order);
  }, [definitions, scope]);
  async function submit(e) {
    e.preventDefault();
    if (!fields.length || fields.some((f) => !values[f.id]))
      return toast.error("Configura o completa las definiciones de medida.");
    try {
      const result = await saveMeasurement({
        cliente_id: id,
        scope,
        fecha: new Date().toISOString(),
        values: fields.map((f) => ({
          definition_id: f.definition_id || f.id,
          value: Number(values[f.id]),
        })),
      });
      toast.success(
        result?.queued
          ? "Medidas guardadas sin conexión"
          : "Medidas registradas",
      );
      navigate(`/clientes/${id}`);
    } catch (e) {
      toast.error(apiError(e));
    }
  }
  return (
    <section>
      <Link
        to={`/clientes/${id}`}
        className="mb-6 inline-block font-semibold text-neutral/55 hover:text-primary"
      >
        ‹ Volver al cliente
      </Link>
      <p className="mb-1 text-xs font-semibold tracking-[.18em] text-primary">
        HISTÓRICO
      </p>
      <h1 className="font-poppins text-4xl font-semibold">Nuevas medidas</h1>
      <Card className="mt-6">
        <div className="mb-6 flex rounded-xl bg-accent p-1">
          <button
            className={`flex-1 rounded-lg px-4 py-3 text-sm ${scope === "superior" ? "bg-white font-semibold text-primary shadow-sm" : "text-neutral/60"}`}
            onClick={() => setScope("superior")}
          >
            Superior
          </button>
          <button
            className={`flex-1 rounded-lg px-4 py-3 text-sm ${scope === "inferior" ? "bg-white font-semibold text-primary shadow-sm" : "text-neutral/60"}`}
            onClick={() => setScope("inferior")}
          >
            Inferior
          </button>
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <InputNumber
              key={field.id}
              label={field.name || field.abbreviation}
              value={values[field.id]}
              onChange={(v) => setValues({ ...values, [field.id]: v })}
            />
          ))}
          {!fields.length && (
            <p className="rounded-xl bg-warning/15 p-4 text-sm text-neutral sm:col-span-2">
              No hay definiciones disponibles. Añádelas en
              `VITE_MEASUREMENT_DEFINITIONS`.
            </p>
          )}
          <div className="sticky bottom-20 -mx-5 mt-2 bg-white/95 p-1 backdrop-blur sm:col-span-2">
            <Button type="submit" className="w-full">
              Guardar medidas
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
