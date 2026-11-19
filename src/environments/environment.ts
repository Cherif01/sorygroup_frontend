/**
 * Environnement de développement — mode démo local.
 * `apiUrl` vide = mock embarqué ; sinon pointe vers le backend local.
 */
export const environment = {
  production: false,
  useMocks: true,
  apiUrl: '',                                           // ex. 'http://localhost/sorygroup/api/v1/'
  apiUrlLocal: 'http://localhost/sorygroup/api/v1/',   // backend local PHP
  apiUrlProd: 'https://api.sorygroup.com/v1/',         // backend production
};
