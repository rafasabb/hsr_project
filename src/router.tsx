import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { StoreProvider } from './store/StoreContext';
import App from './App';
import CharactersPage from './pages/CharactersPage';
import RelicsPage from './pages/RelicsPage';
import Relics2Page from './pages/Relics2Page';
import DashboardPage from './pages/DashboardPage';
import CustomizePage from './pages/CustomizePage';

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

const relics2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relics2',
  component: Relics2Page,
});

// Create the route tree using our routes
const customizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customize',
  component: CustomizePage,
});

// Create the route tree using our routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  charactersRoute,
  relicsRoute,
  relics2Route,
  customizeRoute,
]);

// Create the router using the route tree
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}