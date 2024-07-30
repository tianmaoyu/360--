import proj4 from "proj4"
import exifr from 'exifr'
import * as math from "mathjs"
import * as THREE from "three";



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

export async function get_degree(url) {
    const degrees = Math.PI / 180
    let xmp = await exifr.parse(url, { gps: true, xmp: true })
    // let yaw = degrees* xmp["GimbalYawDegree"]
    // let pitch = degrees* xmp["GimbalPitchDegree"]
    // let roll = degrees* xmp["GimbalRollDegree"]
    let yaw = xmp["GimbalYawDegree"]
    let pitch = xmp["GimbalPitchDegree"]
    let roll = xmp["GimbalRollDegree"]
    return { yaw, pitch, roll }
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
    var result = [x, z, -y]
    // var result = [x, y, z]
    return result
}

// 转换为Web Mercator坐标  
export function wgs84_to_webMercator(lon, lat) {
    var wgs84 = 'EPSG:4326';
    var webMercator = 'EPSG:3857';
    var xy = proj4(wgs84, webMercator, [lon, lat]);
    return xy
}

//北-东-地 相机初始
const R_i = [
    [0, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, -1, 0],
    [0, 0, 0, 1],
];
const three_matrix = [
    [1, 0, 0, 0],
    [0, 0, -1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
];
//云台旋转  Z-Y-X, 关于一个点 旋转
export function rotateMatrix(degrees, about_point) {
    var yaw = degrees.yaw
    var pitch = degrees.pitch
    var roll = degrees.roll
    const yawRad = toRadians(yaw);
    const pitchRad = toRadians(pitch);
    const rollRad = toRadians(roll);


    const T = [
        [1, 0, 0, about_point.x],
        [0, 1, 0, about_point.y],
        [0, 0, 1, about_point.z],
        [0, 0, 0, 1],
    ];

    const T_inv = math.inv(T)

    const Rz = [
        [math.cos(yawRad), -math.sin(yawRad), 0, 0],
        [math.sin(yawRad), math.cos(yawRad), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    const Ry = [
        [math.cos(pitchRad), 0, math.sin(pitchRad), 0],
        [0, 1, 0, 0],
        [-math.sin(pitchRad), 0, math.cos(pitchRad), 0],
        [0, 0, 0, 1],
    ];

    const Rx = [
        [1, 0, 0, 0],
        [0, math.cos(rollRad), -math.sin(rollRad), 0],
        [0, math.sin(rollRad), math.cos(rollRad), 0],
        [0, 0, 0, 1],
    ];

    // Apply rotations in the order Z-Y-X
    const R = math.multiply(math.multiply(Rz, Ry), Rx);
    const R_iR= math.multiply(R_i, R)
    const TR_iR = math.multiply(T,R_iR);
    const TR_iR_inv=math.inv(TR_iR)
    // R_three * (TR_iR)^{-1}
    var resultMatrix= math.multiply(three_matrix,TR_iR_inv);
    var resultMatrix= math.multiply(T,resultMatrix);

    const threeMatrix = new THREE.Matrix4();
    threeMatrix.set(
        resultMatrix[0][0], resultMatrix[0][1], resultMatrix[0][2], resultMatrix[0][3],
        resultMatrix[1][0], resultMatrix[1][1], resultMatrix[1][2], resultMatrix[1][3],
        resultMatrix[2][0], resultMatrix[2][1], resultMatrix[2][2], resultMatrix[2][3],
        resultMatrix[3][0], resultMatrix[3][1], resultMatrix[3][2], resultMatrix[3][3]
    );
    // [Rz.get([0, 0]), Rz.get([0, 1]), Rz.get([0, 2]), 0],  
    // [Rz.get([1, 0]), Rz.get([1, 1]), Rz.get([1, 2]), 0],  
    // [Rz.get([2, 0]), Rz.get([2, 1]), Rz.get([2, 2]), 0],  
    // [0, 0, 0, 1]  

    return threeMatrix
    // return result;
}
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function matrix_to_threeMatrix4(resultMatrix) {
    const threeMatrix = new THREE.Matrix4();
    threeMatrix.set(
        resultMatrix[0][0], resultMatrix[0][1], resultMatrix[0][2], resultMatrix[0][3],
        resultMatrix[1][0], resultMatrix[1][1], resultMatrix[1][2], resultMatrix[1][3],
        resultMatrix[2][0], resultMatrix[2][1], resultMatrix[2][2], resultMatrix[2][3],
        resultMatrix[3][0], resultMatrix[3][1], resultMatrix[3][2], resultMatrix[3][3]
    );
    // [Rz.get([0, 0]), Rz.get([0, 1]), Rz.get([0, 2]), 0],  
    // [Rz.get([1, 0]), Rz.get([1, 1]), Rz.get([1, 2]), 0],  
    // [Rz.get([2, 0]), Rz.get([2, 1]), Rz.get([2, 2]), 0],  
    // [0, 0, 0, 1]  

    return threeMatrix
}