import { UserService } from '../../../core/services/user.service';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';
import { AuthService } from '../../user/services/auth.service';
import { Component, OnInit, resolveForwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin/admin.service';
import { DoctorService } from '../../../core/services/doctor/doctor.service';
import { RecruiterService } from '../../../core/services/recruiter/recruiter.service';

interface Notification {
  id: number;
  title: string;
  time: Date;
  icon: string;
  status?:string;
  role?: string;
  location?: string;
}

interface NotificationCategory {
  name: string;
  icon: string;
  notifications: Notification[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  showNotifications = false;
  showProfileInfo = false;
  notifications: Notification[] = [];
  notificationsEnabled: boolean = false;
  role: string = ""
  notificationCategories: NotificationCategory[] = [];
  selectedCategoryIndex: number = 0;

  get selectedCategory(): NotificationCategory {
    return this.notificationCategories[this.selectedCategoryIndex] || {
      name: '',
      icon: '',
      notifications: []
    };
  }


  constructor(
    private userService: UserService,
    private authService: AuthService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private notificationService: NotificationService,
    private doctorService: DoctorService,
    private recruiterService: RecruiterService,
    private router: Router
  ) { }

  commonNotifications: Notification[] = [
    { id: 1, title: 'Welcome to PawAid!', time: new Date(), icon: 'fa-info-circle' },
    { id: 2, title: 'New feature available', time: new Date(), icon: 'fa-bell' },
  ];

  adminNotifications: NotificationCategory[] = [
  ];

  recruiterNotifications: NotificationCategory[] = [
  ];

  doctorNotifications: NotificationCategory[] = [
  ];


  ngOnInit(): void {
    this.role = this.authService.getRole() ?? '';
    console.log('role isisss', this.role)
    this.getProfile().then(() => {
      this.updateNotifications();
      this.notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    });
  }

  updateNotifications(): void {
    const commonCategory: NotificationCategory = {
      name: 'General',
      icon: 'fa fa-bell',
      notifications: this.commonNotifications
    };

    switch (this.role) {
      case 'admin':
        this.fetchUnverifiedUsers(commonCategory);
        break;
      case 'recruiter':
        this.fetchRescueAlerts(commonCategory)
        break;
      case 'doctor':
        this.notificationCategories = [commonCategory, ...this.doctorNotifications];
        break;
      default:
        this.notificationCategories = [commonCategory];
    }
    this.selectedCategoryIndex = 0;
  }


  fetchRescueAlerts(commonCategory: NotificationCategory) {
    console.log('this profile',this.profile)
    const recruiterId = this.profile._id;
    this.recruiterService.fetchRescueAlertsForRecruiter(recruiterId).subscribe({
      next: (response) => {
        console.log('Fetched alerts:', response);

        const pendingAlerts = response.data.map((alert: any) => ({
          id: alert.id,
          title: `Rescue Alert: ${alert.description}`,
          time: new Date(alert.createdAt),
          icon: 'fa fa-exclamation-circle',
          role: 'recruiter',
          status:alert.status,
          location: `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${alert.location.lat},${alert.location.lng}&travelmode=driving`,
        }));


        const rescueAlertCategory: NotificationCategory = {
          name: 'Rescue Alerts',
          icon: 'fa fa-ambulance',
          notifications: pendingAlerts
        };


        this.notificationCategories = [commonCategory, rescueAlertCategory, ...this.recruiterNotifications];
      },
      error: (error) => {
        console.error('Error fetching alerts:', error);
      }
    });
  }




  fetchUnverifiedUsers(commonCategory: NotificationCategory): void {
    this.adminService.getUnverifiedDoctorsAndRecruiters().subscribe({
      next: (response) => {
        console.log(response)
        const unverifiedDoctors = response.data.doctors.map((doctor: any) => ({
          id: doctor._id,
          title: `Doctor: ${doctor.username} needs verification`,
          time: new Date(doctor.createdAt),
          icon: 'fa fa-user-md',
          role: 'doctor'
        }));

        const unverifiedRecruiters = response.data.recruiters.map((recruiter: any) => ({
          id: recruiter._id,
          title: `Recruiter: ${recruiter.username} needs verification`,
          time: new Date(recruiter.createdAt),
          icon: 'fa fa-users',
          role: 'recruiter'
        }));

        const registrationCategory: NotificationCategory = {
          name: 'Registrations',
          icon: 'fa fa-user-plus',
          notifications: [...unverifiedDoctors, ...unverifiedRecruiters]
        };

        this.notificationCategories = [commonCategory, registrationCategory, ...this.adminNotifications];
      },
      error: (error) => {
        console.error('Failed to fetch unverified users:', error);
      }
    });
  }



  selectCategory(index: number): void {
    this.selectedCategoryIndex = index;
  }

  verifyUser(userId: number, role: string): void {
    this.adminService.verifyUser(userId, role).subscribe({
      next: () => {
        if (role === 'doctor') {
          this.removeVerifiedUser(userId!, 'doctor');
        } else if (role === 'recruiter') {
          this.removeVerifiedUser(userId!, 'recruiter');
        }
        this.toastr.success(`${role.charAt(0).toUpperCase() + role.slice(1)} verified successfully!`);
      },
      error: (error) => {
        console.error('Error during verification:', error);
        this.toastr.error('Failed to verify user', 'Error');
      }
    });
  }

  acceptRescue(notificationId: number): void {
    console.log('Accepting rescue alert with ID:', notificationId);
    this.recruiterService.acceptRescueAlert(notificationId.toString(),this.profile._id).subscribe({
      next: (response) => {
        console.log('Rescue accepted:', response);
        this.toastr.success('Rescue accepted successfully!');
      },
      error: (error) => {
        console.error('Error accepting rescue:', error);
        this.toastr.error('Failed to accept rescue alert');
      }
    });
  }


  startDrive(location: string): void {
    window.open(location, '_blank');

  }




  removeVerifiedUser(userId: number, role: string): void {
    this.notificationCategories.forEach(category => {
      if (category.name === 'Registrations') {
        category.notifications = category.notifications.filter(notification =>
          notification.id !== userId || notification.role !== role
        );
      }
    });
  }




  getProfile(): Promise<void> {
    console.log('Fetching profile data for role:', this.role);
  
    let profileRequest;
  
    if (this.role === 'doctor') {
      profileRequest = this.doctorService.getProfile();
    } else if (this.role === 'recruiter') {
      profileRequest = this.recruiterService.getProfile();
    } else {
      profileRequest = this.userService.getProfile();
    }
  
    return new Promise((resolve, reject) => {
      profileRequest.subscribe({
        next: (response) => {
          console.log('Profile data received:', response);
          this.profile = response.data;
          console.log('this.profile in getProfile', this.profile);
          this.toastr.success('Profile fetched successfully!', 'Success');
          resolve();  
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
          localStorage.removeItem('accessToken');
          this.router.navigate(['/login']);
          this.toastr.error(err.error.message || 'Failed to fetch profile', 'Error');
          reject(err); 
        },
      });
    });
  }
  






  toggleNotificationBar(): void {
    this.showNotifications = !this.showNotifications;
  }

  logout(): void {
    console.log('Logging out');
    this.userService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful:', response);
        localStorage.clear();
        this.toastr.success(response.message, 'Success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
      },
    });
  }

  toggleProfileInfo(): void {
    this.showProfileInfo = !this.showProfileInfo;
  }

  editProfile(): void {
    this.toastr.info('Edit profile feature coming soon!');
  }

  resetPassword(): void {
    this.toastr.info('Reset password feature coming soon!');
  }

  enableNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    this.notificationService.enableNotifications(this.notificationsEnabled);
    localStorage.setItem('notificationsEnabled', this.notificationsEnabled.toString());
  }

}
