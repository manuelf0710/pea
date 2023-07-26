export const environment = {
  production: true,
  apiUrl: "https://pea-ecp.com/index.php/api/",
  server_root: "https://pea-ecp.com",
  auth: {
    postLogin: "auth/login",
    refreshToken: "auth/refresh",
  },
  productos: {
    getByIdProductoRepso: "pea/productobyrepsoid/",
    posByIdProductoRepso: "pea/productobyrepsoid/",
    getProcesarCargue: "pea/productosprocesarcargue/",
    putProductoGestionById: "pea/productoupdategestion/",
    deleteProductoBYId: "pea/productodelete/",
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
    put: "pea/solicitud/",
    getStatsById: "pea/solicitud/statsbyid/",
    getExistSolicitud: "pea/solicitudexist/",
  },
  comun: {
    getRegionales: "comun/regionaleslist",
    buscarContrato: "comun/buscarcontrato",
    getClienteByCedula: "comun/getcliente/",
    buscarUsers: "comun/buscarusers",
    getlistarAllUsers: "comun/listarusuarios/",
    getListaEstadosByIdByUser: "comun/listaestadosbyprofile/",
    getListaById: "comun/listaById/",
    getEstados: "comun/listaestados",
    getOrdenesServicio: "comun/odslista",
  },
  imports: {
    uploadExcelToProductRepso: "files/uploads/",
    importExcelToProductRepso: "imports/importclientesproducto/",
  },
  agenda: {
    getAgendaProfesional: "pea/agenda/profesionalagenda/",
    postAgendaProfesional: "pea/agenda/profesional/",
    putAgendaProfesional: "pea/agenda/cita/",
    postAgendaDisponibleAllProfesional: "pea/agenda/agendadisponible/",
    postCita: "pea/cita",
    postCitasByProfesional: "pea/countcitasbyprofesional",
  },
  admon: {
    postUsersList: "admon/userslist",
    postUsuario: "admon/usuario/",
    putUsuario: "admon/usuario/",
    getProductosByUser: "admon/usuario",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
