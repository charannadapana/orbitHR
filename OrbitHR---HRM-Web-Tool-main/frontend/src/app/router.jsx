import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import EmployeeDashboardPage from '../pages/EmployeeDashboardPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/employee/dashboard',
    element: <EmployeeDashboardPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
