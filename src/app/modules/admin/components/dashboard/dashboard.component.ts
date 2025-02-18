import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TableComponent } from '../../../../components/shared/table/table.component';
import { User } from '../../../../core/models/user.interface';
import { Doctor } from '../../../../core/models/doctor.interface';
import { Recruiter } from '../../../../core/models/recruiter.interface';
import { AdminUserService } from '../../../../core/services/admin/admin-user.service';
import { AdminDoctorService } from '../../../../core/services/admin/admin-doctor.service';
import { AdminRecruiterService } from '../../../../core/services/admin/admin-recruiter.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    SidebarComponent,
    TableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  tableData: any[] = []; 
  filteredData: any[] = []; 

  currentTableTitle: string = 'Dashboard';
  searchQuery: string = '';
  
  currentHeaders: Array<{ key: string; label: string }> = [
    { key: 'no', label: 'No' },
    { key: 'username', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'createdAt', label: 'Joined Date' },
    { key: 'is_block', label: 'Status' }
  ];

  users: User[] = [];
  doctors: Doctor[] = [];
  recruiters: Recruiter[] = [];
  searchableFields = {
    Users: ['username', 'email'],
    Doctors: ['name', 'email'],
    Recruiters: ['name', 'email']
  };

  constructor(
    private adminUserService: AdminUserService,
    private adminDoctorService: AdminDoctorService, 
    private adminRecruiterService:AdminRecruiterService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
  }

  onSearch(searchText: string): void {
    this.searchQuery = searchText.toLowerCase();
    this.applySearch();
  }

  onSidebarItemSelected(item: string): void {
    this.currentTableTitle = item;
    this.searchQuery = '';
    
    switch (item) {
      case 'Users':
        this.currentHeaders = [
          { key: 'no', label: 'No' },
          { key: 'username', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'createdAt', label: 'Joined Date' },
          { key: 'is_block', label: 'Status' }
        ];
        this.fetchUsers();
        break;
      case 'Doctors':
        this.currentHeaders = [
          { key: 'no', label: 'No' },
          { key: 'username', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'createdAt', label: 'Joined Date' },
          { key: 'is_block', label: 'Status' }
        ];
        this.fetchDoctors();
        break;
      case 'Recruiters':
        this.currentHeaders = [
          { key: 'no', label: 'No' },
          { key: 'username', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'createdAt', label: 'Joined Date' },
          { key: 'is_block', label: 'Status' }
        ];
        this.fetchRecruiters();
        break;
       default:
       this.filteredData = []
       break; 
    }
  }

  
  applySearch(): void {

    if (!this.searchQuery) {
      this.filteredData = [...this.tableData];
      return;
    }

    const searchFields = this.searchableFields[this.currentTableTitle as keyof typeof this.searchableFields];
    
    this.filteredData = this.tableData.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(this.searchQuery);
      });
    });
  }

  fetchUsers(): void {
    this.adminUserService.getUsers().subscribe({
      next: (response) => {
        console.log('Users response:', response);
        if (response && response.users) {
          this.users = response.users.map((user: User, index: number) => ({
            ...user,
            no: index + 1,
          }));
          this.tableData = this.users;
          this.filteredData = this.users;
          this.applySearch();
        } else {
          console.error('Invalid response format:', response);
          this.toastr.error('Failed to load users: Invalid response format');
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.toastr.error(err.error?.message || 'Failed to load users');
      },
    });
  }

  fetchDoctors(): void {
    this.adminDoctorService.getDoctors().subscribe({
      next: (response) => {
        console.log('Doctors response:', response);
        if (response && response.doctors) {
          this.doctors = response.doctors.map((doctor: any, index: number) => ({
            ...doctor,
            no: index + 1,
          }));
          this.tableData = this.doctors;
          this.filteredData = this.doctors;
          this.applySearch();
        } else {
          console.error('Invalid response format:', response);
          this.toastr.error('Failed to load doctors: Invalid response format');
        }
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.toastr.error(err.error?.message || 'Failed to load doctors');
      },
    });
  }

  fetchRecruiters(): void {
    this.adminRecruiterService.getRecruiters().subscribe({
      next: (response) => {
        console.log('Recruiters response:', response);
        if (response && response.recruiters) {
          this.recruiters = response.recruiters.map((recruiter: any, index: number) => ({
            ...recruiter,
            no: index + 1,
          }));
          this.tableData = this.recruiters;
          this.filteredData = this.recruiters;
          this.applySearch();
        } else {
          console.error('Invalid response format:', response);
          this.toastr.error('Failed to load recruiters: Invalid response format');
        }
      },
      error: (err) => {
        console.error('Error fetching recruiters:', err);
        this.toastr.error(err.error?.message || 'Failed to load recruiters');
      },
    });
  }

  handleBlockAction(event: {userId: string; currentStatus: boolean}): void {
    const userToUpdate = this.tableData.find(user => user._id === event.userId);
  
    if (!userToUpdate) {
      this.toastr.error('User not found');
      return;
    }
  
    let blockServiceCall;
    let entityType = '';
    let successMessage = '';
  
    switch (this.currentTableTitle) {
      case 'Users':
        blockServiceCall = this.adminUserService.toggleBlockStatus(event.userId, !event.currentStatus);
        entityType = 'User';
        successMessage = `User ${!event.currentStatus ? 'blocked' : 'unblocked'} successfully`;
        break;
      case 'Doctors':
        blockServiceCall = this.adminDoctorService.toggleBlockStatus(event.userId, !event.currentStatus);
        entityType = 'Doctor';
        successMessage = `Doctor ${!event.currentStatus ? 'blocked' : 'unblocked'} successfully`;
        break;
      case 'Recruiters':
        blockServiceCall = this.adminRecruiterService.toggleBlockStatus(event.userId, !event.currentStatus);
        entityType = 'Recruiter';
        successMessage = `Recruiter ${!event.currentStatus ? 'blocked' : 'unblocked'} successfully`;
        break;
    }
  
    if (blockServiceCall) {
      blockServiceCall.subscribe({
        next: (response) => {
          this.tableData = this.tableData.map(item => {
            if (item._id === event.userId) {
              return { ...item, is_block: !event.currentStatus };
            }
            return item;
          });
          this.applySearch();
          this.toastr.success(successMessage); 
        },
        error: (error) => {
          console.error('Error blocking/unblocking user:', error);
          this.toastr.error(`Failed to update ${entityType} status`);
        }
      });
    }
  }
  
}
