import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { StoreProvider } from './store/StoreContext';
import App from './App';
import CharactersPage from './pages/CharactersPage';
import RelicsPage from './pages/RelicsPage';
import DashboardPage from './pages/DashboardPage';

// Create our root route
const rootRoute = createRootRoute({
  component: () => (
    <StoreProvider>
      <App />
    </StoreProvider>
  ),
});

// Create our routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const charactersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/characters',
  component: CharactersPage,
});

const relicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relics',
  component: RelicsPage,
});

// Create the route tree using our routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  charactersRoute,
  relicsRoute,
]);

// Create the router using the route tree
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}