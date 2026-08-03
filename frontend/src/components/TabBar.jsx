import { DollarSign, Ruler, Settings, ShoppingCart, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "Clientes", Icon: Users },
  { to: "/medidas", label: "Medidas", Icon: Ruler },
  { to: "/pedidos", label: "Pedidos", Icon: ShoppingCart },
  { to: "/pagos", label: "Pagos", Icon: DollarSign },
  { to: "/ajustes", label: "Ajustes", Icon: Settings },
];
export default function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[74px] items-center justify-around border-t border-neutral/10 bg-white/95 px-2 shadow-soft backdrop-blur md:left-1/2 md:w-[620px] md:-translate-x-1/2 md:rounded-t-2xl">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            `flex min-w-[58px] flex-col items-center gap-1 text-[10px] font-semibold ${isActive ? "text-primary" : "text-neutral/45"}`
          }
        >
          <Icon size={21} strokeWidth={2.2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
