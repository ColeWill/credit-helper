import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;

  function runGuard(authUser: any) {
    const mockAuth = { onAuthStateChanged: (cb: any) => { cb(authUser); return () => {}; } };
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['createUrlTree', 'navigate']) },
      ],
    });
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    router.createUrlTree.and.returnValue('/login' as any);
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
  }

  it('allows access when user is logged in', (done) => {
    const result = runGuard({ uid: 'abc123' });
    (result as any).subscribe((val: any) => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('redirects to /login when not authenticated', (done) => {
    const result = runGuard(null);
    (result as any).subscribe((val: any) => {
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
