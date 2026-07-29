import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFoundPage } from './not-found-page.component';

describe('NotFoundPage', () => {
  let fixture: ComponentFixture<NotFoundPage>;
  let component: NotFoundPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the not found message', () => {
    const compiled =
      fixture.nativeElement as HTMLElement;

    const heading = compiled.querySelector('h1');

    expect(heading?.textContent?.trim())
      .toBe('La página que buscas no existe');
  });
});