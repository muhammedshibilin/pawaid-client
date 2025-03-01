import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faMapMarkerAlt, faTimes, faCameraRotate, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../../../core/services/upload.service';
import * as piexif from 'piexifjs/dist/piexif';

@Component({
  selector: 'app-upload',
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
    console.log('Starting camera with facing mode:', facingMode);
    
    try {
      await this.cleanupExistingStream();
        const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
  
      try {
        this.stream = await this.requestCamera(constraints);
      } catch (initialError) {
        console.warn('Failed to get specified camera, attempting fallback...', initialError);
        this.stream = await this.attemptFallbackCameras();
      }
  
      if (this.stream) {
        await this.initializeVideoStream();
      } else {
        throw new Error('Failed to initialize any camera');
      }
  
    } catch (error) {
      this.handleCameraError(error);
    }
  }
  
  private async cleanupExistingStream() {
    if (this.stream) {
      console.log('Cleaning up existing stream');
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = null;
      }
    }
  }
  
  private async requestCamera(constraints: MediaStreamConstraints): Promise<MediaStream> {
    console.log('Requesting camera with constraints:', constraints);
    return await navigator.mediaDevices.getUserMedia(constraints);
  }
  
  private async attemptFallbackCameras(): Promise<MediaStream> {
    console.log('Attempting fallback cameras');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      this.currentCamera = 'user';
      return stream;
    } catch (frontError) {
      console.warn('Front camera failed, trying default camera', frontError);
    }
  
    return await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: false
    });
  }
  
  private async initializeVideoStream() {
    if (!this.videoElement?.nativeElement) {
      throw new Error('Video element not found');
    }
  
    console.log('Initializing video stream');
    this.videoElement.nativeElement.srcObject = this.stream;
    
    await new Promise<void>((resolve) => {
      this.videoElement.nativeElement.onloadedmetadata = () => {
        resolve();
      };
    });
  
    await this.videoElement.nativeElement.play();
    this.isCameraOn = true;
  
    const currentTrack = this.stream?.getVideoTracks()[0];
    if (currentTrack) {
      const settings = currentTrack.getSettings();
      console.log('Camera settings:', settings);
      if (settings.facingMode) {
        this.currentCamera = settings.facingMode as 'user' | 'environment';
      }
    }
  }
  
  private handleCameraError(error: any) {
    console.error('Camera initialization failed:', error);
    this.isCameraOn = false;
    this.stream = null;
    
    let errorMessage = 'Could not access camera: ';
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage += 'Permission denied. Please allow camera access.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage += 'No camera found on this device.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage += 'Camera is in use by another application.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }
    
    this.toastr.error(errorMessage, 'Camera Error');
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



 
  async retakePhoto() {
    this.capturedImage = null; 
  
    try {
      this.stopCamera();
  
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = null;
      }
  
      await this.startCamera(this.currentCamera); 
  
      this.isCameraOn = true;
    } catch (error) {
      console.error('Error restarting camera:', error);
      this.toastr.error('Failed to restart camera', 'Error');
    }
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
      const position = await this.getLocationFromGPS();
      
      if (!position) {
        throw new Error('Unable to retrieve location');
      }
  
      this.location = {
        latitude: position.latitude,
        longitude: position.longitude
      };
  
      console.log('Device Location:', this.location);
  
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
  
      ctx.drawImage(video, 0, 0);
  
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
  
        const reader = new FileReader();
        reader.onloadend = async () => {
          const binary = reader.result as string;
  
        
          const exifData = {
            "0th": {},
            "Exif": {},
            "GPS": {
              0: [2, 2, 0, 0],
              1: this.location!.latitude >= 0 ? "N" : "S", 
              2: this.convertToDegreesMinutesSeconds(Math.abs(this.location!.latitude)), 
              3: this.location!.longitude >= 0 ? "E" : "W", 
              4: this.convertToDegreesMinutesSeconds(Math.abs(this.location!.longitude)) 
            }
          };
  
          const exifBytes = piexif.dump(exifData);
          const newJpeg = piexif.insert(exifBytes, binary);
  
          this.capturedImage = newJpeg;
          console.log('EXIF data added:', exifData);
  
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
            reject('Unable to retrieve location'); 
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        reject('Geolocation not supported');
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
      
      const imageBlob = await this.base64ToBlob(this.capturedImage!);
      const imageFile = new File([imageBlob], `animalreport-${Date.now()}.jpg`, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
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
