export const ROUTE_PATHS = {
  home: '',
  country: 'country',
  notFound: 'not-found',
} as const;

export const ROUTE_PARAM_COUNTRY_ID: string = 'id';

export const ROUTE_LINKS = {
  home: `/${ROUTE_PATHS.home}`,
  country: `/${ROUTE_PATHS.country}`,
  notFound: `/${ROUTE_PATHS.notFound}`,
} as const;
