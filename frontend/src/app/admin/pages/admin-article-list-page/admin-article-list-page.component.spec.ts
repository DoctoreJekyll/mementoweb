import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleListPage } from './admin-article-list-page.component';

describe('AdminArticleListPage', () => {
  let component: AdminArticleListPage;
  let fixture: ComponentFixture<AdminArticleListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticleListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
