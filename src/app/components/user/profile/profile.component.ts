import { UserService } from '../../../core/services/user.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';
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
  role?:string;
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
  notificationsEnabled:boolean=false;
  role:string = ""
  notificationCategories: NotificationCategory[] = [];
  selectedCategoryIndex: number = 0;
  
  get selectedCategory(): NotificationCategory {
    return this.notificationCategories[this.selectedCategoryIndex];
  }


  constructor(
    private userService: UserService,
    private authService:AuthService,
    private adminService:AdminService,
    private toastr: ToastrService,
    private notificationService:NotificationService,
    private doctorService:DoctorService,
    private recruiterService:RecruiterService,
    private router:Router
  ) {}

  commonNotifications: Notification[] = [
    { id: 1, title: 'Welcome to PawAid!', time: new Date(), icon: 'fa-info-circle' },
    { id: 2, title: 'New feature available', time: new Date(), icon: 'fa-bell' },
  ];

  adminNotifications: NotificationCategory[] = [
    {
      name: 'System Updates',
      icon: 'fa fa-cog',
      notifications: [
        { id: 1, title: 'System maintenance scheduled', time: new Date(), icon: 'fa fa-wrench' },
        { id: 2, title: 'New version deployed', time: new Date(), icon: 'fa fa-code-branch' }
      ]
    },
    {
      name: 'Reports',
      icon: 'fa fa-flag',
      notifications: [
        { id: 5, title: 'New abuse report', time: new Date(), icon: 'fa fa-exclamation-triangle' },
        { id: 6, title: 'Monthly statistics ready', time: new Date(), icon: 'fa fa-chart-bar' }
      ]
    }
  ];

  recruiterNotifications: NotificationCategory[] = [
    {
      name: 'Rescue Alerts',
      icon: 'fa-ambulance',
      notifications: [
        { id: 1, title: 'Emergency rescue needed', time: new Date(), icon: 'fa-exclamation-circle' },
        { id: 2, title: 'Follow-up required', time: new Date(), icon: 'fa-clipboard-check' }
      ]
    },
    {
      name: 'Adoption Updates',
      icon: 'fa-home',
      notifications: [
        { id: 3, title: 'New adoption request', time: new Date(), icon: 'fa-heart' },
        { id: 4, title: 'Adoption approved', time: new Date(), icon: 'fa-check-circle' }
      ]
    }
  ];

  doctorNotifications: NotificationCategory[] = [
    {
      name: 'Medical Cases',
      icon: 'fa-stethoscope',
      notifications: [
        { id: 1, title: 'Emergency consultation', time: new Date(), icon: 'fa-heartbeat' },
        { id: 2, title: 'Treatment follow-up', time: new Date(), icon: 'fa-notes-medical' }
      ]
    },
    {
      name: 'Appointments',
      icon: 'fa-calendar-alt',
      notifications: [
        { id: 3, title: 'New appointment request', time: new Date(), icon: 'fa-clock' },
        { id: 4, title: 'Schedule updated', time: new Date(), icon: 'fa-calendar-check' }
      ]
    }
  ];


  ngOnInit(): void {
    this.role = this.authService.getRole() ?? '';
    console.log('role isisss',this.role)
    this.updateNotifications();
    this.getProfile();
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
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
        this.notificationCategories = [commonCategory, ...this.recruiterNotifications];
        break;
      case 'doctor':
        this.notificationCategories = [commonCategory, ...this.doctorNotifications];
        break;
      default:
        this.notificationCategories = [commonCategory];
    }
    this.selectedCategoryIndex = 0;
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
  
  
  removeVerifiedUser(userId: number, role: string): void {
    this.notificationCategories.forEach(category => {
      if (category.name === 'Registrations') {
        category.notifications = category.notifications.filter(notification => 
          notification.id !== userId || notification.role !== role
        );
      }
    });
  }
  



  getProfile() {
    console.log('Fetching profile data for role:', this.role);
  
    let profileRequest;
  
    if (this.role === 'doctor') {
      profileRequest = this.doctorService.getProfile(); 
    } else if (this.role === 'recruiter') {
      profileRequest = this.recruiterService.getProfile(); 
    } else {
      profileRequest = this.userService.getProfile();
    }
  
    profileRequest.subscribe({
      next: (response) => {
        console.log('Profile data received:', response);
        this.profile = response.data; // Assign data dynamically
        this.toastr.success('Profile fetched successfully!', 'Success');
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.toastr.error(err.error.message || 'Failed to fetch profile', 'Error');
      },
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
        localStorage.removeItem('accessToken');
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
