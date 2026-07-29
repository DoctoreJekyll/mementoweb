import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleCreatePage } from './admin-article-create-page.component';

describe('AdminArticleCreatePage', () => {
  let component: AdminArticleCreatePage;
  let fixture: ComponentFixture<AdminArticleCreatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleCreatePage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticleCreatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
