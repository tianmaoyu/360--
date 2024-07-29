
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import proj4 from "proj4"
import * as Units from "./units.js"


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0
// camera.up.x = 0;
// camera.up.y = 0;
// camera.up.z = 1;


// 3. 创建渲染器
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var gridHelper = new THREE.GridHelper(1000, 100);
// gridHelper.rotation.x = Math.PI / 2;  
// scene.add(gridHelper);

var axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

// 添加鼠标控制  
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // 启用缩放  
controls.enablePan = true; // 启用平移  


let currentMesh;
let sclae = 100

let lon1 = 109.03551938888889
let lat1 = 34.437857027777774
let alt1 = 90.983

let lon2 = 109.03519866666666
let lat2 = 34.44201283333333
let alt2 = 91.014

let lon3 = 109.03235552777778
let lat3 = 34.43942458333333
let alt3 = 90.33

var point1 = relative_position([lon1, lat1, alt1], [lon3, lat3, alt3])
var point2 = relative_position([lon2, lat2, alt2], [lon3, lat3, alt3])
var point3 = relative_position([lon3, lat3, alt3], [lon3, lat3, alt3])
point1 = point1.map(num => parseFloat(num.toFixed(2)));
point2 = point2.map(num => parseFloat(num.toFixed(2)));
point3 = point3.map(num => parseFloat(num.toFixed(2)));

point1=webMercator_to_three(point1)
point2=webMercator_to_three(point2)
point3=webMercator_to_three(point3)
point1 = point1.map(num => Math.round(num));
point2 = point2.map(num => Math.round(num));
point3 = point3.map(num => Math.round(num));

debugger

var url1 = "./imgs/1.JPG"
var url2 = "./imgs/2.JPG"
var url3 = "./imgs/3.JPG"

// var point1= await Units.get_pose(url1)
// var point2= await Units.get_pose(url2)
// var point3= await Units.get_pose(url3)
// debugger

new THREE.TextureLoader().load(url1, texture => {
  var geometry = new THREE.SphereGeometry(15, 60, 60);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(point1[0], point1[1], point1[2])
  scene.add(mesh);
});




new THREE.TextureLoader().load(url2, texture => {
  var geometry = new THREE.SphereGeometry(15, 60, 60);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(point2[0], point2[1], point2[2])
  scene.add(mesh);
})




new THREE.TextureLoader().load(url3, texture => {
  var geometry = new THREE.SphereGeometry(15, 60, 60);
  geometry.scale(-sclae, sclae, sclae);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0)
  scene.add(mesh);
  currentMesh = mesh
})

var geometry = new LineGeometry()
var pointArr = [
  point1[0], point1[1]-alt1, point1[2],
  point1[0], point1[1], point1[2],
]

geometry.setPositions(pointArr)
var material = new LineMaterial({
  color: 0xffffff,
  linewidth: 4,
  dashed: true,
  dashSize: 2,
  gapSize: 2
})

material.resolution.set(window.innerWidth, window.innerHeight)
var line = new Line2(geometry, material)
line.computeLineDistances()
scene.add(line)


var circle = new THREE.Mesh(
  new THREE.CircleGeometry(0.05, 32),
  new THREE.MeshBasicMaterial({ color: 0xFF0000 })
);
circle.position.set(0, 0, 0)
circle.rotateX(-Math.PI / 2)
scene.add(circle);


// 添加光源  
var ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光  
scene.add(ambientLight);


camera.position.set(-1, 0, 0);
camera.lookAt(new THREE.Vector3(1, 0, 0))


// 创建 Raycaster 和鼠标向量
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// 处理双击事件
function onDoubleClick(event) {
  // 计算鼠标位置在屏幕上的归一化坐标
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // 通过相机和鼠标位置更新射线
  raycaster.setFromCamera(mouse, camera);
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(scene.children);
  // 如果有交点
  for (var item of intersects) {
    const mesh = item.object;
    const isSphere = mesh.geometry instanceof THREE.SphereGeometry;
    if (!isSphere) continue

    if (mesh == currentMesh) break
    changeSphere(mesh)
    break
  }
}

function onDocumentMouseMove(event) {
  // 计算鼠标位置
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // 更新射线投射器
  raycaster.setFromCamera(mouse, camera);
  // 计算物体和射线的交点
  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    for (var item of intersects) {
      const mesh = item.object;
      const isSphere = mesh.geometry instanceof THREE.SphereGeometry;
      if (!isSphere) continue
      if (mesh == currentMesh) continue
      changeCursorToHand(renderer.domElement);
      return
    }
  }
  changeCursorToDefault(renderer.domElement);

}

function changeSphere(nextMesh) {
  // var geometry=new THREE.SphereGeometry() 
  var x = nextMesh.position.x
  var y = nextMesh.position.y
  var z = nextMesh.position.z
  camera.position.set(x - 1, y, z);
  camera.lookAt(new THREE.Vector3(x + 1, y, z))
  // 当前的缩小
  currentMesh.geometry.scale(1 / sclae, 1 / sclae, 1 / sclae)
  //下一个
  nextMesh.geometry.scale(sclae, sclae, sclae)
  currentMesh = nextMesh

  // 设置围绕的中心点
  controls.target.set(x, y, z); // 替换 x, y, z 为你的坐标值
  // 更新相机位置以匹配新的目标点
  camera.updateProjectionMatrix();
  controls.update();
}


function changeCursorToHand(element) {
  element.style.cursor = 'pointer';
}

function changeCursorToDefault(element) {
  element.style.cursor = 'default';
}

// 添加双击事件监听
window.addEventListener('dblclick', onDoubleClick);
// 添加鼠标事件监听器
window.addEventListener('mousemove', onDocumentMouseMove, false);

// 调整窗口大小时更新渲染器和相机
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// 北东地-转 three
function webMercator_to_three(point){
  var x=point[0]
  var y=point[1]
  var z=point[2]
  return [x,z,-y]
}
// 相对的 坐标 x,y,z
function relative_position(point, origin_point) {

  var origin_lon = origin_point[0]
  var origin_lat = origin_point[1]
  var origin_alt = origin_point[2]

  var origin_xy = wgs84_to_webMercator(origin_lon, origin_lat)

  var lon = point[0]
  var lat = point[1]
  var alt = point[2]

  var xy = wgs84_to_webMercator(lon, lat)

  var result = [xy[0]-origin_xy[0], xy[1]-origin_xy[1], alt-origin_alt]
  console.info("相对：", result)
  return result

}

// 转换为Web Mercator坐标  
function wgs84_to_webMercator(lon, lat) {
  var wgs84 = 'EPSG:4326';
  var webMercator = 'EPSG:3857';
  var xy = proj4(wgs84, webMercator, [lon, lat]);
  return xy
}

// 渲染循环  
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();  