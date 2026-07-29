import {
  Component,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';

import { AdminArticleApiService } from '../../articles/admin-article-api.service';

@Component({
  selector: 'app-admin-article-create-page',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-article-create-page.component.html',
  styleUrl: './admin-article-create-page.component.scss'
})
export class AdminArticleCreatePage {
  private readonly adminArticleApiService =
    inject(AdminArticleApiService);

  private readonly router = inject(Router);

  protected readonly isSubmitting =
    signal(false);

  protected readonly submitError =
    signal(false);

  protected readonly form = new FormGroup({
    title: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(255)
        ]
      }
    )
  });

  protected get titleControl() {
    return this.form.controls.title;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(false);

    const title =
      this.titleControl.value.trim();

    this.adminArticleApiService
      .createArticle({ title })
      .subscribe({
        next: () => {
          this.router.navigate([
            '/admin/articulos'
          ]);
        },
        error: error => {
          console.error(
            'Could not create article',
            error
          );

          this.submitError.set(true);
          this.isSubmitting.set(false);
        }
      });
  }
}