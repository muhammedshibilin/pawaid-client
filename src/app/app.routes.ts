import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './modules/common/error/not-found/not-found.component';
import { LoginComponent } from './modules/common/login/login.component';
import { preventAuthGuard } from './core/guards/prevent-auth.guard';
import { RegisterComponent } from './modules/common/register/register.component';
import { VerifyEmailComponent } from './modules/common/verify-email/verify-email.component';
import { OtpComponent } from './modules/common/otp/otp.component';
import { ResetPasswordComponent } from './modules/common/reset-password/reset-password.component';

export const routes: Routes = [
  { 
    path: 'admin', 
    loadChildren: () => import('./modules/admin/admin.module')
      .then(m => m.AdminModule)
  },
  { 
    path: '', 
    loadChildren: () => import('./modules/user/user.module')
      .then(m => m.UserModule)
  },
  {path:'login',component:LoginComponent,canActivate:[preventAuthGuard]},
  {path:'register',component:RegisterComponent,canActivate:[preventAuthGuard]},
  {path:'verify-email',component:VerifyEmailComponent},
  {path:'otp',component:OtpComponent},
  {path:'reset-password',component:ResetPasswordComponent},
  {path:'404',component: NotFoundComponent},
  {path: '**',redirectTo: '404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
