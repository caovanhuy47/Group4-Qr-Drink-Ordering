import React from 'react';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { useRestaurant } from './contexts/useRestaurant';
import { DishDetailModal } from './components/customer/DishDetailModal';
import { CustomerAuthModal } from './components/customer/CustomerAuthModal';
import { ToastContainer } from './components/common/ToastContainer';

// Customer Views
import { FoodLobbyView } from './views/customer/FoodLobbyView';
import { CartView } from './views/customer/CartView';
import { OrderConfirmationView } from './views/customer/OrderConfirmationView';
import { OrderTrackingView } from './views/customer/OrderTrackingView';

// Staff & Admin Views
import { StaffLoginView } from './views/admin/StaffLoginView';
import { OverviewDashboardView } from './views/admin/OverviewDashboardView';
import { TableManagementView } from './views/admin/TableManagementView';
import { PaymentHistoryView } from './views/admin/PaymentHistoryView';
import { MenuManagementView } from './views/admin/MenuManagementView';
import { CategoryManagementView } from './views/admin/CategoryManagementView';
import { BannerManagementView } from './views/admin/BannerManagementView';
import { StaffRbacView } from './views/admin/StaffRbacView';
import { StaffProfileView } from './views/admin/StaffProfileView';

const InAppToast: React.FC = () => {
  const { toast, clearToast } = useRestaurant();
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-up pointer-events-auto px-4 md:px-0">
      <div
        className={`p-3.5 rounded-2xl shadow-warm-lg flex items-center justify-between gap-3 border ${
          toast.type === 'success'
            ? 'bg-tertiary-soft border-tertiary/30 text-tertiary'
            : toast.type === 'error'
            ? 'bg-error-container/40 border-error/30 text-error'
            : 'bg-surface-container-lowest border-border text-on-surface shadow-warm-md'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[20px] shrink-0">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="text-xs md:text-sm font-semibold truncate">{toast.text}</span>
        </div>
        <button
          onClick={clearToast}
          className="p-1 rounded-full hover:bg-black/5 text-on-surface-variant shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { viewRoute, selectedDishForDetail } = useRestaurant();

  const renderActiveView = () => {
    switch (viewRoute) {
      case 'lobby':
        return <FoodLobbyView />;
      case 'cart':
        return <CartView />;
      case 'order-confirm':
        return <OrderConfirmationView />;
      case 'order-tracking':
        return <OrderTrackingView />;
      case 'login':
        return <StaffLoginView />;
      case 'admin/overview':
        return <OverviewDashboardView />;
      case 'admin/tables':
        return <TableManagementView />;
      case 'admin/history':
        return <PaymentHistoryView />;
      case 'admin/menu':
        return <MenuManagementView />;
      case 'admin/categories':
        return <CategoryManagementView />;
      case 'admin/banners':
        return <BannerManagementView />;
      case 'admin/staff':
        return <StaffRbacView />;
      case 'admin/profile':
        return <StaffProfileView />;
      default:
        return <FoodLobbyView />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col w-full selection:bg-primary-soft selection:text-primary">
      {/* Active Route Content: Natural Responsive Layout */}
      <div className="w-full flex-1">
        {renderActiveView()}
      </div>

      {/* Dish Detail BottomSheet on Mobile, Popup on Desktop */}
      {selectedDishForDetail && (
        <DishDetailModal key={selectedDishForDetail.id} />
      )}

      {/* Customer Account & Membership Modal */}
      <CustomerAuthModal />

      {/* Global In-App Notification Toast */}
      <InAppToast />

      {/* Legacy/App Toast Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RestaurantProvider>
      <MainContent />
    </RestaurantProvider>
  );
};

export default App;
