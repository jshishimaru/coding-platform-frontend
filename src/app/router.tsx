import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { QuestionListPage } from '@/features/questions/pages/QuestionListPage';
import { ContestListPage } from '@/features/contests/pages/ContestListPage';
import { SandboxPage } from '@/features/sandbox/pages/SandboxPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/questions',
        element: <QuestionListPage />,
      },
      {
        path: '/contests',
        element: <ContestListPage />,
      },
      {
        path: '/sandbox',
        element: <SandboxPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
