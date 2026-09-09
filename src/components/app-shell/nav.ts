import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  PiggyBank,
  Tags,
  Upload,
  Wallet,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/accounts", label: "Contas", icon: Wallet },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/rules", label: "Regras", icon: Wand2 },
  { href: "/budgets", label: "Orçamentos", icon: PiggyBank },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/import", label: "Importar CSV", icon: Upload },
];
