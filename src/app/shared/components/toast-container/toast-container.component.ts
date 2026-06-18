import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts(); trackBy: trackByFn"
           [ngClass]="['toast-card', toast.type]"
           (click)="toastService.remove(toast.id)">
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <svg *ngIf="toast.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg *ngIf="toast.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="toast-body">
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close-btn" (click)="$event.stopPropagation(); toastService.remove(toast.id)">&times;</button>
        <div class="toast-progress animate" [style.animation-duration.ms]="toast.duration || 4000"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 85px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 320px;
      max-width: 420px;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 8px 12px -6px rgba(0, 0, 0, 0.05);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .toast-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 36px -5px rgba(0, 0, 0, 0.15), 0 10px 14px -5px rgba(0, 0, 0, 0.08);
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .toast-icon svg {
      width: 15px;
      height: 15px;
    }

    /* Types customization */
    .toast-card.success {
      border-left: 4px solid #10b981;
    }
    .toast-card.success .toast-icon {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }

    .toast-card.error {
      border-left: 4px solid #ef4444;
    }
    .toast-card.error .toast-icon {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    .toast-card.warning {
      border-left: 4px solid #f59e0b;
    }
    .toast-card.warning .toast-icon {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    .toast-card.info {
      border-left: 4px solid #3b82f6;
    }
    .toast-card.info .toast-icon {
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
    }

    .toast-body {
      flex-grow: 1;
      padding-right: 8px;
    }

    .toast-message {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.4;
    }

    .toast-close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 20px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      transition: color 0.2s;
    }

    .toast-close-btn:hover {
      color: #4b5563;
    }

    /* Progress bar animation */
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: rgba(0, 0, 0, 0.08);
    }

    .toast-progress.animate {
      animation: shrink linear forwards;
    }

    .toast-card.success .toast-progress { background: #10b981; }
    .toast-card.error .toast-progress { background: #ef4444; }
    .toast-card.warning .toast-progress { background: #f59e0b; }
    .toast-card.info .toast-progress { background: #3b82f6; }

    @keyframes slideIn {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes shrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  trackByFn(index: number, item: any) {
    return item.id;
  }
}
