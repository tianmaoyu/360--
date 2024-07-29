
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

import proj4 from "proj4"
import * as Units from "./units.js"

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0



// 3. 创建渲染器
// var renderer = new THREE.WebGLRenderer();
var renderer = new THREE.WebGLRenderer({ antialias: true, });
renderer.setPixelRatio(window.devicePixelRatio);
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


let currentMesh = null;
let sclae = 100


var url1 = "./imgs/1.JPG"
var url2 = "./imgs/2.JPG"
var url3 = "./imgs/3.JPG"

var point1 = await Units.get_pose(url1)
var point2 = await Units.get_pose(url2)
var point3 = await Units.get_pose(url3)

var degree1 = await Units.get_degree(url1)
var degree2 = await Units.get_degree(url2)
var degree3 = await Units.get_degree(url3)

var xyz_list = Units.lonlat_to_xyz([point1, point2, point3])
var origin = Units.relative_origin(xyz_list)
point1 = Units.relative_position(xyz_list[0], origin)
point2 = Units.relative_position(xyz_list[1], origin)
point3 = Units.relative_position(xyz_list[2], origin)
point1 = point1.map(num => Math.round(num));
point2 = point2.map(num => Math.round(num));
point3 = point3.map(num => Math.round(num));

new THREE.TextureLoader().load(url1, texture => {
  var geometry = new THREE.SphereGeometry(15, 60, 120);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  material.map.colorSpace = 'srgb';
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(point1[0], point1[1], point1[2])
  scene.add(mesh);
});




new THREE.TextureLoader().load(url2, texture => {
  var geometry = new THREE.SphereGeometry(15, 60, 120);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  // 颜色不一致
  material.map.colorSpace = 'srgb';
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(point2[0], point2[1], point2[2])
  scene.add(mesh);
})


new THREE.TextureLoader().load(url3, texture => {
  var geometry = new THREE.SphereGeometry(15, 60, 120);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  material.map.colorSpace = 'srgb';
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(point3[0], point3[1], point3[2])
  scene.add(mesh);
})

let line1 = get_line(point1, origin)
scene.add(line1)
let line2 = get_line(point2, origin)
scene.add(line2)
let line3 = get_line(point3, origin)
scene.add(line3)

var label_1 = create_label("1.JPG", point1)
var label_2 = create_label("2.JPG", point2)
var label_3 = create_label("3.JPG", point3)

function get_line(point, origin) {
  var geometry = new LineGeometry()
  var pointArr = [
    point[0], point[1] - origin.z - 15, point[2],
    point[0], point[1] - 15, point[2],
  ]

  geometry.setPositions(pointArr)
  var material = new LineMaterial({
    color: 0xffffff,
    linewidth: 2,
    dashed: true,
    dashSize: 2,
    gapSize: 2
  })

  material.resolution.set(window.innerWidth, window.innerHeight)
  var line = new Line2(geometry, material)
  line.computeLineDistances()
  return line
}


function create_label(name, point) {
  // 创建一个Canvas元素  
  let x=point[0]
  let y=point[1]-100
  let z=point[2] 

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  context.font = "30px 宋体";
  const metrics = context.measureText(name);
  const textWidth = metrics.width;
  // 设置Canvas的尺寸  
  canvas.width = textWidth ; // 给文字留一些边距  
  canvas.height = 30; // 高度可以根据字体大小调整  
  // 再次设置字体样式，因为Canvas尺寸更改会重置样式  
  context.font = "30px 宋体";
  context.fillStyle = "rgba(255, 255, 0, 1)"; // 黄色文字  
  context.clearRect(0, 0, canvas.width, canvas.height); // 清除背景  
  context.fillText(name, 5, 22); // 调整Y坐标以适应字体基线  
  // 创建一个纹理  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true; // 更新纹理  
  // 创建平面几何体  
  const planeGeometry = new THREE.PlaneGeometry(canvas.width / 100, canvas.height / 100); // 将Canvas尺寸转换为3D空间尺寸  
  planeGeometry.scale(100, 100, 100)
  // 创建材质  
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true // 使背景透明  
  });
  // 创建网格模型  
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  // 设置位置  
  planeMesh.position.set(x, y, z);
  // 面向摄像机  
  planeMesh.lookAt(camera.position);
  // 添加到场景  
  scene.add(planeMesh);
  return planeMesh
}


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


camera.position.set(-1, 1, 0);
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
  if (currentMesh) {
    currentMesh.geometry.scale(1 / sclae, 1 / sclae, 1 / sclae)
  }
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


// 渲染循环  
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // label_1.lookAt(camera.position);
  // label_2.lookAt(camera.position);
  // label_3.lookAt(camera.position);
}
animate();  