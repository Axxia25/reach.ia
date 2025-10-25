"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AppSidebarProps {
  className?: string;
  user: any;
  userProfile: any;
  onSignOut: () => void;
  vendedores?: any[];
}

export default function Sidebar({
  user,
  userProfile,
  onSignOut,
  className,
  vendedores = [],
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVendedoresOpen, setIsVendedoresOpen] = useState(false);
  const [isMetricasOpen, setIsMetricasOpen] = useState(false); // NOVO: Estado para menu Métricas
  const { theme, setTheme } = useTheme();
  const router = useRouter(); // NOVO: Router para navegação

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    // REMOVIDO: Item "Métricas" simples - substituído por menu collapsible abaixo
  ];

  // Processar vendedores dinâmicos (mantido igual)
  const vendedoresList = vendedores.map((vendedor) => ({
    name: vendedor.vendedor,
    href: `/dashboard/vendedor/${encodeURIComponent(vendedor.vendedor)}`,
  }));

  // DEBUG: Adicionar logs para diagnosticar (mantido igual)
  console.log("🔍 Debug sidebar:", { vendedores, vendedoresList });

  const adminNavItems = [
    {
      title: "Gestão de Usuários",
      href: "/dashboard/admin/usuarios",
      icon: Users,
    },
    {
      title: "Configurações",
      href: "/dashboard/configuracoes",
      icon: Settings,
    },
  ];

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Header (mantido igual) */}
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && <h2 className="text-lg font-semibold">CRM Leads</h2>}
          <div className="flex items-center space-x-1">
            {/* Dark Mode Toggle (mantido igual) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 w-8"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Alternar tema</TooltipContent>
            </Tooltip>

            {/* Collapse Toggle (mantido igual) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? "Expandir sidebar" : "Contrair sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {/* Main Navigation - Dashboard (mantido igual) */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "px-2"
                    )}
                    asChild
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </a>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>

          {/* NOVO: Seção Métricas Collapsible */}
          <div className="space-y-1">
            <Collapsible open={isMetricasOpen} onOpenChange={setIsMetricasOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isCollapsed && "px-2"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">Métricas</span>
                          <ChevronDown
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform",
                              isMetricasOpen && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Métricas</TooltipContent>
                )}
              </Tooltip>

              {!isCollapsed && (
                <CollapsibleContent className="space-y-1">
                  {/* Métricas Financeiras */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start pl-8 text-muted-foreground hover:bg-accent"
                    onClick={() =>
                      router.push("/dashboard/metricas/financeiras")
                    }
                  >
                    <DollarSign className="mr-2 h-3 w-3" />
                    <span className="flex-1 text-left">Financeiras</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                      Em Desenvolvimento
                    </span>
                  </Button>

                  {/* Métricas de Produto */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start pl-8 text-muted-foreground hover:bg-accent"
                    onClick={() => router.push("/dashboard/metricas/produto")}
                  >
                    <Car className="mr-2 h-3 w-3" />
                    Produto
                  </Button>

                  {/* Métricas Comerciais */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start pl-8 text-muted-foreground hover:bg-accent"
                    onClick={() => router.push("/dashboard/metricas/comercial")}
                  >
                    <TrendingUp className="mr-2 h-3 w-3" />
                    Comercial
                  </Button>
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>

          <Separator />

          {/* Vendedores Section (mantido igual) */}
          <div className="space-y-1">
            <Collapsible
              open={isVendedoresOpen}
              onOpenChange={setIsVendedoresOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isCollapsed && "px-2"
                      )}
                    >
                      <UserCheck className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">Vendedores</span>
                          <ChevronDown
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform",
                              isVendedoresOpen && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Vendedores</TooltipContent>
                )}
              </Tooltip>

              {!isCollapsed && (
                <CollapsibleContent className="space-y-1">
                  {vendedoresList.map((vendedor, index) => (
                    <Button
                      key={`vendedor-${vendedor.name}-${index}`}
                      variant="ghost"
                      className="w-full justify-start pl-8"
                      asChild
                    >
                      <a href={vendedor.href}>
                        <Target className="h-3 w-3" />
                        <span className="ml-3">{vendedor.name}</span>
                      </a>
                    </Button>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>

          <Separator />

          {/* Admin Navigation (mantido igual) */}
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "px-2"
                    )}
                    asChild
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </a>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </nav>

        {/* Footer - User Profile (mantido igual) */}
        <div className="p-4">
          <Separator className="mb-4" />
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center space-x-3 rounded-lg p-2 hover:bg-accent cursor-pointer",
                  isCollapsed && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      Moreno Guimarães
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Admin
                    </p>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <div>
                  <p className="font-medium">Moreno Guimarães</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
