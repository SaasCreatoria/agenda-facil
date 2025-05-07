
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import AppHeader from './header';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <h1 className="text-2xl font-semibold text-primary group-data-[collapsible=icon]:hidden">Agenda Fácil</h1>
           <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
              <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM13.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM14.25 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM15.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM16.5 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 .75h-1.5a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 2.25H1.5a.75.75 0 0 0-.75.75V21a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75V2.25h-1.5a.75.75 0 0 0-.75-.75H6.75ZM7.5 6H16.5v3.75H7.5V6Z" clipRule="evenodd" />
            </svg>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Footer content if any, e.g. user profile, logout */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <ScrollArea className="flex-1">
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
