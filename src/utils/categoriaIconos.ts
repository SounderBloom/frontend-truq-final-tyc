const ICONOS: Record<string, string> = {
    ropa: 'apparel',
    moda: 'apparel',
    electronica: 'devices',
    electrónica: 'devices',
    hogar: 'home',
    alimentos: 'restaurant',
    accesorios: 'watch',
    deportes: 'sports_soccer',
    herramientas: 'construction',
    mascotas: 'pets',
    libros: 'menu_book',
    juguetes: 'toys',
    coleccionables: 'category',
}

export function iconoCategoria(nombre: string): string {
    const clave = nombre.trim().toLowerCase()
    return ICONOS[clave] ?? 'more_horiz'
}
