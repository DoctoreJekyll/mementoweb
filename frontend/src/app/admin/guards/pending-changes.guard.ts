import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesAware {
  hasPendingChanges(): boolean;
}

export const pendingChangesGuard:
  CanDeactivateFn<PendingChangesAware> = (
    component,
  ) => {
    if (!component.hasPendingChanges()) {
      return true;
    }

    return window.confirm(
      'Tienes cambios sin guardar. '
      + 'Si sales ahora, se perderán. '
      + '¿Quieres continuar?',
    );
  };