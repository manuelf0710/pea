export const environment = {
  production: true,
  apiUrl: "http://localhost:8000/api",
  server_root: "http://localhost:8000",
  auth: {
    postLogin: "auth/login",
    refreshToken: "auth/refresh",
  },
  tipoproductos: {
    getAll: "pea/tipoproductoslist",
  },
  tipoproductos_user: {
    getAll: "pea/tipoproductouserlist",
    getById: "pea/tipoproductousers/",
  },
  solicitud: {
    getAll: "pea/solicitudes",
    getById: "pea/solicitud/",
    post: "pea/solicitud",
  },
  comun: {
    getRegionales: "comun/regionaleslist",
    buscarContrato: "comun/buscarcontrato",
  },
};
