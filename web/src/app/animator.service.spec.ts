import { TestBed } from '@angular/core/testing';

import { AnimatorService } from './animator.service';

describe('AnimatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnimatorService = TestBed.get(AnimatorService);
    expect(service).toBeTruthy();
  });
});
