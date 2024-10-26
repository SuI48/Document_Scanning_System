import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: () => true } }
      ]
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if user is logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const result = guard.canActivate();
    expect(result).toBe(true);
  });

  it('should navigate to login if user is not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    spyOn(router, 'navigate');
    const result = guard.canActivate();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
