import { TestBed } from '@angular/core/testing';

import { AllModulesService } from './all-modules.service';

describe('AllModulesService', () => {
  let service: AllModulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllModulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
