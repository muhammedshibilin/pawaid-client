import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faMapMarkerAlt, faTimes, faCameraRotate, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  constructor(private uploadService: UploadService, private toastr: ToastrService) {}


  @ViewChild('videoElement') videoElement!: ElementRef;
  @Output() closeModalEvent = new EventEmitter<void>();

  title: string = '';
  isCameraOn: boolean = false;
  capturedImage: string | null = null;
  location: { latitude: number; longitude: number } | null = null;
  currentCamera: 'user' | 'environment' = 'environment'; 
  
  // Font Awesome icons
  faCamera = faCamera;
  faMapMarkerAlt = faMapMarkerAlt;
  faTimes = faTimes;
  faCameraRotate = faCameraRotate;
  faRotateRight = faRotateRight;
  faSpinner = faSpinner;

  private stream: MediaStream | null = null;
  async ngAfterViewInit() {
    const cameras = await this.checkAvailableCameras();
    console.log(`Available cameras: ${cameras.length}`);
    this.startCamera('user');
    this.isCameraOn = true;
  }

  async startCamera(facingMode: 'user' | 'environment' = this.currentCamera) {
    try {
      if (this.stream) {
        this.stopCamera();
      }

      try {
        // First attempt with specified facing mode
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode
          }
        });
      } catch (initialError) {
        console.warn('Failed to get specified camera, trying fallback options...');
        
        try {
          // Try to get front camera specifically
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user'
            }
          });
          this.currentCamera = 'user';
        } catch (frontCameraError) {
          // If front camera fails, try any available camera
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          console.warn('Using default available camera');
        }
      }

      if (this.stream) {
        this.videoElement.nativeElement.srcObject = this.stream;
        await this.videoElement.nativeElement.play();
        this.isCameraOn = true;
        // Update currentCamera only if the initial requested camera was successful
        if (this.stream.getVideoTracks()[0].getSettings().facingMode === facingMode) {
          this.currentCamera = facingMode;
        }
      } else {
        throw new Error('No camera stream available');
      }

    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access any camera');
      this.isCameraOn = false;
    }
  }

  // Helper method to check available cameras
  async checkAvailableCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  // Modified switchCamera method to handle fallbacks
  async switchCamera() {
    const cameras = await this.checkAvailableCameras();
    
    if (cameras.length < 2) {
      alert('Only one camera is available on this device');
      return;
    }

    const newMode = this.currentCamera === 'user' ? 'environment' : 'user';
    console.log('Switching to:', newMode);
    await this.startCamera(newMode);
  }



  captureImage() {
    if (!this.isCameraOn) return;
    
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    this.capturedImage = canvas.toDataURL('image/jpeg');
    
    this.stopCamera();
  }

  retakePhoto(){
    this.capturedImage = null;
    this.startCamera();
  }
 

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraOn = false;
  }

  getLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
         },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }


  isValid(): boolean {
    return this.title.trim().length > 0 && !!this.capturedImage;
  }
  submit() {
    if (this.isValid()) {
      // Create FormData object
      const formData = new FormData();
      
      // Convert base64 image to blob
      const imageBlob = this.dataURItoBlob(this.capturedImage!);
      const imageFile = new File([imageBlob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
  
      // Append all data
      formData.append('title', this.title.trim());
      formData.append('image', imageFile);
      formData.append('location', JSON.stringify(this.location));
  
      this.uploadService.uploadReport(formData).subscribe({
        next: (response) => {
          console.log('Response:', response);
          this.toastr.success('Data submitted successfully', 'Success');
          this.closeModal();
        },
        error: (error) => {
          console.error('Error submitting data:', error);
          this.toastr.error('Failed to submit data', 'Error');
        },
      });
    }
  }
  
  // Helper function to convert base64 to blob
  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([ab], { type: mimeString });
  }


  closeModal() {
    this.stopCamera();
    this.closeModalEvent.emit();
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
