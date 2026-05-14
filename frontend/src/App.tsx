import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { ROUTES } from './constants/routes'
import AppLayout from './components/common/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CategoryPage from './pages/CategoryPage'
import TodoListPage from './pages/TodoListPage'
import TodoFormPage from './pages/TodoFormPage'
import SettingsPage from './pages/SettingsPage'

const queryClient = new QueryClient()

function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}

function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to={ROUTES.TODOS} replace /> : <Outlet />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.TODOS} element={<TodoListPage />} />
              <Route path={ROUTES.TODO_NEW} element={<TodoFormPage />} />
              <Route path={ROUTES.TODO_EDIT} element={<TodoFormPage />} />
              <Route path={ROUTES.CATEGORIES} element={<CategoryPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
