export interface BgTable {
    buttons: {
        acciones:{}, 
        exports: [], 
    },
    listado_seleccion: boolean,
    columns : [],
    url     : string,
    globalSearch: boolean,
    rowSearch: boolean,
    advancedSearch:boolean,
    paginatorPosition: string,
    customFilters?: []
}