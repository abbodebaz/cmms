import { RouteObject } from 'react-router';

import Authenticated from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import appRoutes from './app';
import accountRoutes from './account';
import oauthRoutes from './oauth';
import { lazy, Suspense } from 'react';
import SuspenseLoader from '../components/SuspenseLoader';
import Status404 from '../content/pages/Status/Status404';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

const PaymentSuccess = Loader(
  lazy(() => import('../content/pages/Payment/Success'))
);

const LandingPage = Loader(lazy(() => import('../content/pages/Landing')));

const RequestPortalPublicPage = Loader(
  lazy(
    () =>
      import(
        '../content/own/Settings/Features/RequestPortal/PublicPage/RequestPortalPublicPage'
      )
  )
);

const router: RouteObject[] = [
  {
    path: 'account',
    children: accountRoutes
  },
  { path: 'oauth2', children: oauthRoutes },
  {
    path: 'payment/success',
    element: <PaymentSuccess />
  },
  {
    path: 'request-portal/:uuid',
    element: <RequestPortalPublicPage />
  },
  {
    path: 'app',
    element: (
      <Authenticated>
        <ExtendedSidebarLayout />
      </Authenticated>
    ),
    children: appRoutes
  },
  {
    path: '',
    element: <LandingPage />
  },
  {
    path: '*',
    element: <Status404 />
  }
];

export default router;
