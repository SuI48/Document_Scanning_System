import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  openMenu: string | null = null;
  showPopover = false;
  currentMenu: string | null = null;
  popoverStyles: any = {};
  role: string;
  popoverTimeout: any;

  constructor(private authService: AuthService, private router: Router) {
    this.role = this.authService.getUserRole();

    // Mevcut route'a göre menüyü açık tutmak için subscribe oluyoruz
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActiveMenu(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.checkScreenSize(window.innerWidth);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMenu(menu: string) {
    if (!this.isCollapsed) {
        if (this.openMenu === menu) {
            // Eğer aynı menüye tekrar tıklanırsa menüyü kapat
            this.openMenu = null;
        } else {
            this.openMenu = menu;
        }
    } else {
        this.openMenu = null;
    }
}


  isMenuOpen(menu: string): boolean {
    return this.openMenu === menu;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize(event.target.innerWidth);
  }

  checkScreenSize(width: number) {
    if (width <= 768) {
      this.isCollapsed = true;
    } else {
      this.isCollapsed = false;
    }
  }

  setActiveMenu(url: string) {
    if (url.includes('add-user') || url.includes('user-list')) {
      this.openMenu = 'userManagement';
    } else if (url.includes('document')) {
      this.openMenu = 'documentManagement';
    } else if (url.includes('request')) {
      this.openMenu = 'requestManagement';
    } else if (url.includes('user-activities')) {
      this.openMenu = 'reports';
    } else {
      this.openMenu = null;
    }
  }

  openPopover(event: MouseEvent, menu: string) {
    if (this.isCollapsed) {
      this.clearPopoverTimeout();
      this.currentMenu = menu;
      this.showPopover = true;
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.popoverStyles = {
        top: `${rect.top}px`,
        left: `${rect.right + 10}px`
      };
    }
  }

  keepPopoverOpen() {
    this.clearPopoverTimeout();
    this.showPopover = true;
  }

  closePopover() {
    this.clearPopoverTimeout();
    this.popoverTimeout = setTimeout(() => {
      this.showPopover = false;
      this.currentMenu = null;
    }, 300); 
  }

  clearPopoverTimeout() {
    if (this.popoverTimeout) {
      clearTimeout(this.popoverTimeout);
      this.popoverTimeout = null;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
