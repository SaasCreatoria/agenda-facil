
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Users,
  Contact,
  BellRing,
  Settings,
  Globe,
  LucideIcon,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { href: '/servicos', label: 'Serviços', icon: Briefcase },
  { href: '/profissionais', label: 'Profissionais', icon: Users },
  { href: '/clientes', label: 'Clientes', icon: Contact },
  { href: '/lembretes', label: 'Lembretes', icon: BellRing },
  { href: '/configuracao', label: 'Configuração', icon: Settings },
  { href: '/publica', label: 'Página Pública', icon: Globe },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              tooltip={item.label}
              className={cn(
                "w-full justify-start",
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
          {item.subItems && (
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                  <Link href={subItem.href} passHref legacyBehavior>
                    <SidebarMenuSubButton
                      isActive={pathname === subItem.href}
                       className={cn(
                         pathname === subItem.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                       )}
                       aria-current={pathname === subItem.href ? "page" : undefined}
                    >
                      {/* Sub item icon could go here if needed */}
                      <span>{subItem.label}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
