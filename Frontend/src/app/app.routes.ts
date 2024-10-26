import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserListComponent } from './user-management/user-list/user-list.component';
import { UserAddComponent } from './user-management/user-add/user-add.component';
import { DocumentUploadComponent } from './document-management/document-upload/document-upload.component';
import { DocumentListComponent } from './document-management/document-list/document-list.component';
import { DocumentVersioningComponent } from './document-management/document-versioning/document-versioning.component';
import { RequestApproveComponent } from './request-management/request-approve/request-approve.component';
import { RequestHistoryComponent } from './request-management/request-history/request-history.component';
import { UserActivitiesComponent } from './reports/user-activities/user-activities.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'user-list/:type', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'add-user/:type', component: UserAddComponent, canActivate: [AuthGuard] },
  { path: 'document-upload', component: DocumentUploadComponent, canActivate: [AuthGuard] },
  { path: 'document-list', component: DocumentListComponent, canActivate: [AuthGuard] },
  { path: 'document-versioning', component: DocumentVersioningComponent, canActivate: [AuthGuard] },
  { path: 'request-approve', component: RequestApproveComponent, canActivate: [AuthGuard] },
  { path: 'request-history', component: RequestHistoryComponent, canActivate: [AuthGuard] },
  { path: 'user-activities', component: UserActivitiesComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
