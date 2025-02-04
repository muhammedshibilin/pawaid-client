import { TestBed } from '@angular/core/testing';

import { AdminRecruiterService } from './admin-recruiter.service';

describe('AdminRecruiterService', () => {
  let service: AdminRecruiterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminRecruiterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
