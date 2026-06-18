import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { log } from 'console';

@Component({
  selector: 'app-analytics-wrapper',
  template: `
    <div *ngIf="loading" style="padding: 20px; font-family: sans-serif; color: #4b5563; font-weight: 500;">
      Loading Analytics Dashboard...
    </div>
    <div *ngIf="errorMessage" style="padding: 20px; font-family: sans-serif; color: #ef4444; font-weight: 500;">
      {{ errorMessage }}
    </div>
    <div id="react-analytics-root"></div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class AnalyticsWrapperComponent implements OnInit, OnDestroy {
  loading = true;
  errorMessage: string | null = null;
  private scriptId = 'react-analytics-script';

  ngOnInit() {
    console.log('[MFE-Host] AnalyticsWrapperComponent: ngOnInit triggered. Starting React script load...');
    this.loadReactScript()
      .then(() => {
        console.log('[MFE-Host] AnalyticsWrapperComponent: React script load promise resolved successfully.');
        this.loading = false;
        this.mountReactApp();
      })
      .catch((err) => {
        console.error('[MFE-Host] AnalyticsWrapperComponent: React script load promise rejected!', err);
        this.loading = false;
        this.errorMessage = 'Failed to load the Analytics dashboard. Please ensure the React app is running on http://localhost:3000';
      });
  }

  ngOnDestroy() {
    console.log('[MFE-Host] AnalyticsWrapperComponent: ngOnDestroy triggered. Starting React unmount...');
    const win = window as any;
    if (typeof win.unmountReactAnalytics === 'function') {
      try {
        console.log('[MFE-Host] AnalyticsWrapperComponent: Invoking win.unmountReactAnalytics("react-analytics-root")');
        win.unmountReactAnalytics('react-analytics-root');
        console.log('[MFE-Host] AnalyticsWrapperComponent: React application unmounted successfully.');
      } catch (e) {
        console.error('[MFE-Host] AnalyticsWrapperComponent: Error unmounting React app:', e);
      }
    } else {
      console.warn('[MFE-Host] AnalyticsWrapperComponent: win.unmountReactAnalytics helper function was not found!');
    }
  }

  private loadReactScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If script tag is already present in document body, resolve immediately
      if (document.getElementById(this.scriptId)) {
        console.log(this.scriptId + "------------------->Script Id");
        console.log('[MFE-Host] loadReactScript: Script tag with ID "react-analytics-script" already exists in DOM. Skipping loading...');
        resolve();
        return;
      }
      console.log(this.scriptId + "------------------->Script Id");
      console.log('[MFE-Host] loadReactScript: Appending script tag for React bundle: http://localhost:3000/bundle.js');
      const script = document.createElement('script');
      script.id = this.scriptId;
      script.src = 'http://localhost:3000/bundle.js';
      script.async = true;
      script.onload = () => {
        console.log('[MFE-Host] loadReactScript: bundle.js script tag loaded successfully.');
        resolve();
      };
      script.onerror = (err) => {
        console.error('[MFE-Host] loadReactScript: script tag failed to load:', err);
        reject(err);
      };
      document.body.appendChild(script);
    });
  }

  private mountReactApp() {
    const win = window as any;
    if (typeof win.mountReactAnalytics === 'function') {
      console.log('[MFE-Host] mountReactApp: Invoking win.mountReactAnalytics("react-analytics-root")');
      win.mountReactAnalytics('react-analytics-root');
      console.log('[MFE-Host] mountReactApp: React app successfully rendered inside the target element.');
    } else {
      console.error('[MFE-Host] mountReactApp: win.mountReactAnalytics function is missing on the window object!');
      this.errorMessage = 'Could not initialize the Analytics dashboard (mount lifecycle helper not found).';
    }
  }
}

