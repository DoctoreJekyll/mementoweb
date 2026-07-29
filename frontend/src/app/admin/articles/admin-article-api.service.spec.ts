import { TestBed } from '@angular/core/testing';

import { AdminArticleApiService } from './admin-article-api.service';

describe('AdminArticleApi', () => {
  let service: AdminArticleApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminArticleApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
