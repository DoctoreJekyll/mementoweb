import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLoginPage } from './admin-login-page.component';

describe('AdminLoginPage', () => {
  let component: AdminLoginPage;
  let fixture: ComponentFixture<AdminLoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoginPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
