import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleEditPage } from './admin-article-edit-page.component';

describe('AdminArticleEditPage', () => {
  let component: AdminArticleEditPage;
  let fixture: ComponentFixture<AdminArticleEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleEditPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticleEditPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
