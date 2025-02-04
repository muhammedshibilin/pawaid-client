// quick-ball.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  CdkDrag, 
  DragDropModule, 
  CdkDragStart, 
  CdkDragMove, 
  CdkDragEnd 
} from '@angular/cdk/drag-drop';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-quick-ball',
  standalone:true,
  imports: [CommonModule,DragDropModule],
  templateUrl: './quick-ball.component.html',
  styleUrls: ['./quick-ball.component.css'],
  animations: [
    trigger('ballState', [
      state('normal', style({
        transform: 'scale(1)'
      })),
      state('dragging', style({
        transform: 'scale(0.95)',
        opacity: '0.8'
      })),
      transition('* <=> *', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('iconRotate', [
      state('normal', style({
        transform: 'rotate(0deg)'
      })),
      state('expanded', style({
        transform: 'rotate(360deg)'
      })),
      transition('* <=> *', animate('300ms ease-out'))
    ])
  ]
})
export class QuickBallComponent {
  inputId = `fileInput_${Math.random().toString(36).substr(2, 9)}`;
  position = { 
    x: window.innerWidth - 80,
    y: window.innerHeight / 2
  };
  private lastPosition = { ...this.position };
  isDragging = false;
  isExpanded = false;

  // Track mouse offset relative to ball
  private mouseOffset = { x: 0, y: 0 };

  // Add property to track ball position
  get isOnRightSide(): boolean {
    const screenMiddle = window.innerWidth / 2;
    return this.position.x > screenMiddle;
  }

  get state(): string {
    if (this.isDragging) return 'dragging';
    if (this.isExpanded) return 'expanded';
    return 'normal';
  }

  get containerClasses(): string {
    return `
      quick-ball-container
      bg-yellow-400 
      rounded-full 
      flex items-center 
      justify-center 
      shadow-lg 
      transition-all 
      duration-300 
      ease-in-out
      ${this.isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}
      w-12
      h-12
    `.trim();
  }

  get labelClasses(): string {
    return `
      flex items-center 
      justify-center 
      gap-1.5
      w-full 
      h-full 
      text-white 
      cursor-pointer 
      px-3
      ${this.isDragging ? 'pointer-events-none' : ''}
      ${this.isOnRightSide ? 'flex-row-reverse' : 'flex-row'}
    `.trim();
  }

  constrainPosition = (point: { x: number, y: number }) => {
    const ballSize = 48; // Fixed size
    const maxX = window.innerWidth - ballSize;
    const maxY = window.innerHeight - ballSize;
    
    return {
      x: Math.max(0, Math.min(point.x, maxX)),
      y: Math.max(0, Math.min(point.y, maxY))
    };
  };

  onDragStarted(event: CdkDragStart): void {
    this.isDragging = true;
    this.isExpanded = false;

    // Calculate mouse offset from ball center
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    
    // Get the click position relative to the ball
    const clientX = event.event instanceof MouseEvent 
      ? event.event.clientX 
      : event.event.touches[0].clientX;
    
    const clientY = event.event instanceof MouseEvent 
      ? event.event.clientY 
      : event.event.touches[0].clientY;

    // Calculate offset from click point to ball center
    this.mouseOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  onDragMoved(event: CdkDragMove): void {
    // Calculate new position keeping the ball under the mouse
    const newPosition = {
      x: event.pointerPosition.x - this.mouseOffset.x,
      y: event.pointerPosition.y - this.mouseOffset.y
    };

    // Apply constraints
    this.position = this.constrainPosition(newPosition);
  }

  onDragEnded(event: CdkDragEnd): void {
    this.isDragging = false;
    
    // Get current position
    const currentX = this.position.x;
    const ballSize = 64; // Fixed size
    const screenMiddle = window.innerWidth / 2;
    
    // Calculate distances to edges
    const distanceToLeft = currentX;
    const distanceToRight = window.innerWidth - (currentX + ballSize);
    
    // Snap to nearest edge
    let targetX;
    if (distanceToLeft < distanceToRight) {
      targetX = 0;
    } else {
      targetX = window.innerWidth - ballSize;
    }

    // Smooth transition to edge
    this.position = {
      x: targetX,
      y: this.position.y
    };
    
    this.addBounceAnimation();
  }

  onHover(isHovering: boolean): void {
    if (!this.isDragging) {
      this.isExpanded = isHovering;
    }
  }

  private addBounceAnimation(): void {
    const element = document.querySelector('.quick-ball-container');
    if (!element) return;

    element.classList.add('bounce');
    setTimeout(() => {
      element.classList.remove('bounce');
    }, 300);
  }

 

  @Output() openModal = new EventEmitter<void>();

  onBallClick(event: MouseEvent): void {
    // Only open modal if not dragging
    if (!this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      this.openModal.emit();
    }
  }
}