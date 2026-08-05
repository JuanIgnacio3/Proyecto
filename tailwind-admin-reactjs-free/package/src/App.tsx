import { RouterProvider } from 'react-router';
import router from './routes/Router';
import './css/globals.css';
import { ThemeProvider } from './components/provider/theme-provider';
import { AuthProvider } from './context/auth-context';
import { ConfirmProvider } from './components/institutional';

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <ConfirmProvider>
            <RouterProvider router={router} />
          </ConfirmProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
