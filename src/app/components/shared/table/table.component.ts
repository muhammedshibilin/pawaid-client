import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { FirstLetterCapitalPipe } from '../../../core/pipes/first-letter-capital.pipe';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule,FirstLetterCapitalPipe],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() tableData: any[] = [];
  @Input() tableTitle: string = '';
  @Input() headers: Array<{ key: string; label: string }> = [];
  @Input() pageSize: number = 5;
  @Input() showActions: boolean = true;
  @Input() currentTableTitle: string = '';
  @Output() blockAction = new EventEmitter<{ userId: string; currentStatus: boolean }>();

  isLoading: boolean = false;
  error: string | null = null;
  sortedDirection: string = 'asc';
  currentPage: number = 1;

  ngOnInit(): void {
    if (!Array.isArray(this.tableData)) {
      this.tableData = [];
    }
    
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 50,
      easing: 'ease-in-out-cubic',
      anchorPlacement: 'top-bottom',
      delay: 100,
    });
  }

  ngOnChanges() {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }

  sortByName() {
    this.sortedDirection = this.sortedDirection === 'asc' ? 'desc' : 'asc';
    this.tableData = [...this.tableData].sort((a, b) => {
      const valueA = (a.username || a.name)?.toString().toLowerCase() || '';
      const valueB = (b.username || b.name)?.toString().toLowerCase() || '';

      if (valueA < valueB) return this.sortedDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortedDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.tableData.slice(startIndex, startIndex + this.pageSize);
  }

  setPage(page: number | string) {
    if (typeof page === 'number' && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages() {
    return Math.ceil(this.tableData.length / this.pageSize);
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (this.currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    for (let i = Math.max(2, this.currentPage - 1); 
         i <= Math.min(totalPages - 1, this.currentPage + 1); i++) {
      pages.push(i);
    }

    if (this.currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  blockUser(userId: string, currentStatus: boolean) {
    this.blockAction.emit({ userId, currentStatus });
  }
}