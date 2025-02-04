
import { DashboardComponent } from './dashboard/dashboard.component';
import { adminGuard } from '../../core/guards/admin.guard';
import { UnauthorizedComponent } from '../error/unauthorized/unauthorized.component';
import { ProfileComponent } from '../user/profile/profile.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {path:'profile',component:ProfileComponent}
    ]
  },
  { path: 'unauthorized', component: UnauthorizedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}