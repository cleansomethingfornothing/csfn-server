import CoordsBound from '../types/CoordsBound'
import Coords from '../types/Coords'

export function coordsFromString(coords: string): Coords {
    if (!coords) {
        return
    }
    // tslint:disable-next-line:one-variable-per-declaration
    let lat, lng
    [lat, lng] = coords.split(',')
    return {lat, lng}
}

export function coordsBoundFromString(bounds: string): CoordsBound {
    if (!bounds) {
        return
    }
    // tslint:disable-next-line:one-variable-per-declaration variable-name
    let lat_sw, lng_sw, lat_ne, lng_ne
    [lat_sw, lng_sw, lat_ne, lng_ne] = bounds.split(',')

    return {sw: {lat: lat_sw, lng: lng_sw}, ne: {lat: lat_ne, lng: lng_ne}}
}

export function coordsBoundsToPolygon({sw, ne}: CoordsBound) {
    return `POLYGON((
  ${sw.lat} ${sw.lng},
  ${sw.lat} ${ne.lng},
  ${ne.lat} ${ne.lng},
  ${ne.lat} ${sw.lng},
  ${sw.lat} ${sw.lng}))`
}

export function coordsToPoint({lat, lng}: Coords) {
    return `POINT(${Number(lat)} ${Number(lng)})`
}