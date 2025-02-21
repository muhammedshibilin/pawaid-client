import { UserService } from '../../../core/services/user.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../user/components/services/auth.service';
import { Component, OnInit, resolveForwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin/admin.service';
import { DoctorService } from '../../doctor/services/doctor.service';
import { RecruiterService } from '../../rescuer/service/recruiter.service';
import { AnimalService } from '../../animal/services/animal.service';
import { AnimalReportUpdateResponse } from '../../../core/interfaces/responses/animal-report.interface';
import { AnimalStatus } from '../../../core/enums/animal-status.enum';
import { IDoctor } from '../../../core/interfaces/entities/doctor.interface';
import { map, of, switchMap } from 'rxjs';

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
    private animalService:AnimalService,
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
        this.updateRecruiterNotification(commonCategory)
        break;
      case 'doctor':
        this.updateDoctorNotifications(commonCategory)
      break;
      default:
        this.notificationCategories = [commonCategory];
    }
    this.selectedCategoryIndex = 0;
  }

  updateDoctorNotifications(commonCategory: NotificationCategory) {
    const doctorId = this.profile._id;
    this.doctorService.fetchRescueAppointment(doctorId).subscribe({
      next: (response) => {
        console.log("Fetched Appointments:",response);
  
        const appointmentNotifications = response.data.map((appointment: any) => ({
          id: appointment.id,
          title: `Rescue Appointment: ${appointment.description}`,
          time: new Date(appointment.date),
          icon: "fa fa-user-md",
          role: "doctor",
          status: appointment.status,
        }));
  
        const appointmentCategory: NotificationCategory = {
          name: "Rescue Appointments",
          icon: "fa fa-calendar-check",
          notifications: appointmentNotifications,
        };
  
        this.notificationCategories = [commonCategory, appointmentCategory, ...this.notificationCategories];
      },
      error: (error) => {
        console.error("Error fetching appointments:", error);
      },
    });
  }
  

  updateRecruiterNotification(commonCategory: NotificationCategory) {
    const recruiterId = this.profile._id;
    this.recruiterService.fetchRescueAlertsForRecruiter(recruiterId).pipe(
      switchMap((response) => {
        if (!Array.isArray(response.data) || response.data.length === 0) {
          return of(null); 
        }

        console.log('dtaaa')
        const pendingAlerts = response.data.map((alert: any) => ({
          id: alert.id,
          title: `Rescue Alert: ${alert.description}`,
          time: new Date(alert.date),
          icon: 'fa fa-exclamation-circle',
          role: 'recruiter',
          status: alert.status,
          location: `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${alert.location.lat},${alert.location.lng}&travelmode=driving`,
        }));

        const rescueAlertCategory: NotificationCategory = {
          name: 'Rescue Alerts',
          icon: 'fa fa-ambulance',
          notifications: pendingAlerts
        };

        this.notificationCategories = [commonCategory, rescueAlertCategory, ...this.recruiterNotifications];

        const firstAlert = response.data[0];
        if ([AnimalStatus.PICKED, AnimalStatus.BOOKED, AnimalStatus.TREATED].includes(firstAlert.status)) {
          return this.fetchNearbyDoctors({ latitude: firstAlert.location.lat, longitude: firstAlert.location.lng });
        }
        return of(null);
      })
    ).subscribe((nearbyDoctors) => {
      if (nearbyDoctors) {
        console.log('nearby docotors',nearbyDoctors)
        const index = this.notificationCategories.findIndex(cat => cat.name === "Available Doctors");
        if (index !== -1) {
          this.notificationCategories[index] = nearbyDoctors;
        } else {
          this.notificationCategories.push(nearbyDoctors);
        }
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

  updateRescue(notificationId: number, status: string, role: 'recruiter' | 'doctor', location?: string): void {
    console.log('Updating rescue alert with ID:', notificationId, this.profile._id, location);
  
    const body: any = { 
      animalReportId: notificationId.toString(), 
      status 
    };
  
    if (role === 'recruiter') {
      body.recruiterId = this.profile._id;
    } else if (role === 'doctor') {
      body.doctorId = this.profile._id;
    }
  
    if (location) {
      const coords = this.extractCoordinatesFromUrl(location);
      if (coords) {
        body.location = coords; 
      }
    }
  
    this.animalService.updateAlert(body).subscribe({
      next: (response: AnimalReportUpdateResponse) => {
        console.log('Rescue updated:', response);
        this.toastr.success('Rescue updated successfully!');

        if (response.data.status === AnimalStatus.PICKED) {
          console.log("Fetching nearby doctors after rescue picked:", response.data.location);
          
          this.fetchNearbyDoctors({ latitude: response.data.location.latitude, longitude: response.data.location.longitude })
            .subscribe(nearbyDoctors => {
              console.log("Fetched Nearby Doctors:", nearbyDoctors);

              const index = this.notificationCategories.findIndex(cat => cat.name === "Available Doctors");
              if (index !== -1) {
                this.notificationCategories[index] = nearbyDoctors;
              } else {
                this.notificationCategories.push(nearbyDoctors);
              }
            });
        }
      },
      error: (error) => {
        console.error('Error updating rescue:', error);
        this.toastr.error('Failed to update rescue alert');
      }
    });
  }

  
  fetchNearbyDoctors(location: { latitude: number; longitude: number }) {
    console.log('location',location)
    return this.doctorService.fetchNearbyDoctors(location).pipe(
      map((doctors: IDoctor[]) => ({
        name: "Available Doctors",
        icon: "fa fa-stethoscope",
        notifications: doctors.map((doctor: IDoctor) => ({
          id: doctor._id,
          title: `Dr. ${doctor.username}`,
          icon: "fa fa-user-md",
          time: new Date(doctor.createdAt!),
          status:'available',
        }))
      }))
    );
  }
  
  
  private extractCoordinatesFromUrl(url: string): { latitude: number; longitude: number } | null {
    const match = url.match(/destination=([-+]?\d*\.\d+),([-+]?\d*\.\d+)/);
    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2])
      };
    }
    return null;
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
