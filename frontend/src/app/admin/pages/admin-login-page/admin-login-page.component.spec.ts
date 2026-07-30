import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminAuthService } from '../../auth/admin-auth.service';
import { AdminLoginPage } from './admin-login-page.component';

describe('AdminLoginPage', () => {
  let component: AdminLoginPage;
  let fixture: ComponentFixture<AdminLoginPage>;

  const adminAuthServiceStub = {
    login(username: string, _password: string) {
      return of({
        username,
      });
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoginPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: AdminAuthService,
          useValue: adminAuthServiceStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginPage);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
