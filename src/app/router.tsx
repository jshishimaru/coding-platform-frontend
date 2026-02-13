import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '../layouts/root-layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <div>Home</div>
      </RootLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <RootLayout>
        <div>Login</div>
      </RootLayout>
    ),
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
