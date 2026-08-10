import { TipoOferta, DireccionMonto } from '../models/PropuestaDTO'

export function etiquetaTipoOferta(tipo: TipoOferta): string {
    switch (tipo) {
        case TipoOferta.Compra: return 'Oferta de compra'
        case TipoOferta.TruequeConDiferencia: return 'Trueque + diferencia'
        case TipoOferta.SolicitudDonacion: return 'Solicitud de donación'
        default: return 'Trueque'
    }
}

export function etiquetaDireccionMonto(direccion: DireccionMonto): string {
    return direccion === DireccionMonto.ProponentePagaAlVendedor
        ? 'Yo pongo la diferencia en efectivo'
        : 'Pido que el vendedor me pague la diferencia'
}
