import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';

const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jasmine.createSpy().and.callFake((cb: any) => { cb(null); return () => {}; }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Auth, useValue: mockAuth }],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uid returns null when not logged in', () => {
    expect(service.uid).toBeNull();
  });

  it('currentUser returns null initially', () => {
    expect(service.currentUser()).toBeNull();
  });
});
