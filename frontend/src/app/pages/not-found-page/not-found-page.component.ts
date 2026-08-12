import { Component, inject, type OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
})
export class NotFoundPage implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setNotFoundPage();
  }
}
