import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;

  function setup(user: any) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { currentUser: signal(user) } },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', [
            'createUrlTree',
            'navigate',
          ]),
        },
      ],
    });
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    router.createUrlTree.and.returnValue('/login' as any);
  }

  it('allows access when user is logged in', (done) => {
    setup({ uid: 'abc123' });
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    (result as any).subscribe((val: any) => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('redirects to /login when not authenticated', (done) => {
    setup(null);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    (result as any).subscribe((val: any) => {
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
