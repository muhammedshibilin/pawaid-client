import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { preventAuthGuard } from './prevent-auth.guard';

describe('preventAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => preventAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
