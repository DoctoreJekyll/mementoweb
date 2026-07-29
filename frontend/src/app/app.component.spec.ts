import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the application', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should render the site identity', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const siteName = compiled.querySelector(
      '.site-header__name'
    );

    const footer = compiled.querySelector(
      '.site-footer'
    );

    expect(siteName?.textContent?.trim())
      .toBe('Memento vivere');

    expect(footer?.textContent)
      .toContain('Memento vivere');
  });
});