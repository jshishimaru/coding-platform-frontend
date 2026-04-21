import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { QuestionListPage } from '@/features/questions/pages/QuestionListPage';
import { QuestionDetailPage } from '@/features/questions/pages/QuestionDetailPage';
import { ContestListPage } from '@/features/contests/pages/ContestListPage';
import { ContestDetailPage } from '@/features/contests/pages/ContestDetailPage';
import { GroupListPage } from '@/features/groups/pages/GroupListPage';
import { GroupDetailPage } from '@/features/groups/pages/GroupDetailPage';
import { MySubmissionsPage } from '@/features/submissions/pages/MySubmissionsPage';
import { SubmissionDetailPage } from '@/features/submissions/pages/SubmissionDetailPage';
import { SandboxPage } from '@/features/sandbox/pages/SandboxPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';

const router = createBrowserRouter([
  // Public routes (no auth required)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  // Protected routes (auth required)
  {
    element: <ProtectedRoute />,
    children: [
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
            path: '/questions/:slug',
            element: <QuestionDetailPage />,
          },
          {
            path: '/contests',
            element: <ContestListPage />,
          },
          {
            path: '/contests/:contestId/problems/:slug',
            element: <QuestionDetailPage />,
          },
          {
            path: '/contests/:id',
            element: <ContestDetailPage />,
          },
          {
            path: '/groups',
            element: <GroupListPage />,
          },
          {
            path: '/groups/:id',
            element: <GroupDetailPage />,
          },
          {
            path: '/submissions',
            element: <MySubmissionsPage />,
          },
          {
            path: '/submissions/:id',
            element: <SubmissionDetailPage />,
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
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
