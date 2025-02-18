import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from '../common/profile/profile.component';
import { DonateComponent } from './components/donate/donate.component';
import { HomeComponent } from '../common/home/home.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'donate', component: DonateComponent, canActivate: [authGuard] }
];


@NgModule({ 
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
