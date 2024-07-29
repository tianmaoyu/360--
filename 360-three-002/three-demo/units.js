import proj4 from "proj4"
import exifr from 'exifr'

/**
 * 获取图片的GPS位置信息。
 */
export async function get_pose(url) {
    let xmp = await exifr.parse(url, { gps: true, xmp: true })
    let latitude = xmp["latitude"]
    let longitude = xmp["longitude"]
    let altitude = xmp["RelativeAltitude"]
    return { longitude, latitude, altitude }
}

export function lonlat_to_xyz(points) {
    let xyz_points = []
    for (let point of points) {
        let lon = point.longitude;
        let lat = point.latitude;
        var xy = wgs84_to_webMercator(lon, lat)
        let alt = point.altitude;
        xyz_points.push({ x: xy[0], y: xy[1], z: alt })
    }
    return xyz_points
}

export function relative_origin(xyz_points) {
    let sum_x = 0;
    let sum_y = 0;
    let sum_z = 0;
    for (let point of xyz_points) {
        sum_x += point.x
        sum_y += point.y
        sum_z += point.z
    }
    let length = xyz_points.length
    return {
        x: sum_x / length,
        y: sum_y / length,
        z: sum_z / length
    }
}


// 相对的 坐标 x,y,z
export function relative_position(point, origin) {
    let x = point.x - origin.x
    let y = point.y - origin.y
    let z = point.z - origin.z
    var result = [x,z,-y]
    return result
}

// 转换为Web Mercator坐标  
export function wgs84_to_webMercator(lon, lat) {
    var wgs84 = 'EPSG:4326';
    var webMercator = 'EPSG:3857';
    var xy = proj4(wgs84, webMercator, [lon, lat]);
    return xy
}
