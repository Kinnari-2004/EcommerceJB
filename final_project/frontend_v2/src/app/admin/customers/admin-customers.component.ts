import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminCustomer } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page-header"><h1>Customers</h1></div>
    @if (loading()) {
      <div class="spinner-wrap"><div class="spinner"></div></div>
    } @else if (customers().length === 0) {
      <div class="empty-state"><div class="empty-icon">👥</div><p>No customers registered yet.</p></div>
    } @else {
      <div class="card" style="overflow:auto">
        <table class="table">
          <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            @for (c of customers(); track c.id) {
              <tr>
                <td><strong>{{c.name}}</strong></td>
                <td>{{c.email}}</td>
                <td>{{c.createdAt | date:'mediumDate'}}</td>
                <td>
                  <span class="badge-pill" [class.badge-success]="!c.isLocked" [class.badge-danger]="c.isLocked">
                    {{c.isLocked ? 'Locked' : 'Active'}}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm"
                          [class.btn-danger]="!c.isLocked"
                          [class.btn-outline]="c.isLocked"
                          (click)="toggleLock(c)">
                    {{c.isLocked ? 'Unlock' : 'Lock'}}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`.admin-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; } .admin-page-header h1 { font-size:1.5rem; font-weight:700; }`]
})
export class AdminCustomersComponent implements OnInit {
  customers = signal<AdminCustomer[]>([]);
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.loading.set(true);
    this.adminService.getCustomers().subscribe({
      next: c => { this.customers.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleLock(customer: AdminCustomer) {
    const action = customer.isLocked ? 'unlock' : 'lock';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${customer.name}?`)) return;
    this.adminService.setLock(customer.id, !customer.isLocked).subscribe(() => this.loadCustomers());
  }
}
