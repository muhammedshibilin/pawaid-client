import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faMapMarkerAlt, faTimes, faCameraRotate, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../../core/services/upload.service';
import { environment } from '../../../../environments/environment.development';
import piexif from 'piexifjs';

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
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode
          }
        });
      } catch (initialError) {
        console.warn('Failed to get specified camera, trying fallback options...');
        
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user'
            }
          });
          this.currentCamera = 'user';
        } catch (frontCameraError) {
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

  async checkAvailableCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

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



  isValid(): boolean {
    return this.title.trim().length > 0 && !!this.capturedImage;
  }
 
  async captureImage() {
    if (!this.isCameraOn) return;
  
    try {
      // Get the location from the device using GPS
      const position = await this.getLocationFromGPS();
      
      if (!position) {
        throw new Error('Unable to retrieve location');
      }
  
      this.location = {
        latitude: position.latitude,
        longitude: position.longitude
      };
  
      console.log('Device Location:', this.location);
  
      // Proceed with image capturing
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
  
      ctx.drawImage(video, 0, 0);
  
      // Convert canvas to Blob and add EXIF data
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
  
        const reader = new FileReader();
        reader.onloadend = async () => {
          const binary = reader.result as string;
  
          // Create EXIF data
          const exifData = {
            "0th": {},
            "Exif": {},
            "GPS": {
              0: [2, 2, 0, 0], // GPSVersionID
              1: this.location!.latitude >= 0 ? "N" : "S", // GPSLatitudeRef
              2: this.convertToDegreesMinutesSeconds(Math.abs(this.location!.latitude)), // GPSLatitude
              3: this.location!.longitude >= 0 ? "E" : "W", // GPSLongitudeRef
              4: this.convertToDegreesMinutesSeconds(Math.abs(this.location!.longitude)) // GPSLongitude
            }
          };
  
          // Add EXIF to image using piexif.js
          const exifBytes = piexif.dump(exifData);
          const newJpeg = piexif.insert(exifBytes, binary);
  
          // Store both the image and location
          this.capturedImage = newJpeg;
          console.log('EXIF data added:', exifData);
  
          // Verify EXIF data
          const exifObj = piexif.load(this.capturedImage);
          console.log('Verified EXIF data:', exifObj);
        };
  
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 1.0);
  
      this.stopCamera();
    } catch (error) {
      console.error('Error capturing image with geotag:', error);
    }
  }
  
  // Function to get location from GPS
  async getLocationFromGPS(): Promise<{ latitude: number, longitude: number } | null> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting GPS location:', error);
            reject('Unable to retrieve location');  // Reject if GPS fails
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        reject('Geolocation not supported');  // Reject if geolocation is not supported
      }
    });
  }
  
  private convertToDegreesMinutesSeconds(decimal: number): Array<[number, number]> {
    const degrees = Math.floor(decimal);
    const minutesFloat = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.round((minutesFloat - minutes) * 60 * 100);
    
    return [
      [degrees, 1],
      [minutes, 1],
      [seconds, 100]
    ];
  }

async submit() {
  if (this.isValid()) {
    try {
      const formData = new FormData();
      
      // Convert captured image to Blob
      const imageBlob = await this.base64ToBlob(this.capturedImage!);
      const imageFile = new File([imageBlob], `animalreport-${Date.now()}.jpg`, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // Append image, title, and location to form data
      formData.append('title', this.title.trim());
      formData.append('image', imageFile);
      formData.append('location', JSON.stringify(this.location));
      
      this.uploadService.uploadReport(formData).subscribe({
        next: (response) => {
          console.log('Upload Response:', response);
          this.toastr.success('Data submitted successfully', 'Success');
          this.closeModal();
        },
        error: (error) => {
          console.error('Error submitting data:', error);
          this.toastr.error('Failed to submit data', 'Error');
        },
      });
    } catch (error) {
      console.error('Error preparing upload:', error);
      this.toastr.error('Error preparing upload', 'Error');
    }
  }
}

private async base64ToBlob(base64String: string): Promise<Blob> {
  const base64 = base64String.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: 'image/jpeg' });
}


  closeModal() {
    this.stopCamera();
    this.closeModalEvent.emit();
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
