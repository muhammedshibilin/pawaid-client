import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  @Input() isExpanded = true;
  @Output() searchEvent = new EventEmitter<string>();
  currentDate: Date = new Date();

  constructor(private router:Router){}

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchEvent.emit(input.value);
  }

  navigateToProfile(){
    this.router.navigate(['/admin/profile'])
  }
}
