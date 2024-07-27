
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0

// 3. 创建渲染器
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var gridHelper = new THREE.GridHelper(1000, 100);
// gridHelper.rotation.x = Math.PI / 2;  
scene.add(gridHelper);
var axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

// 添加鼠标控制  
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // 启用缩放  
controls.enablePan = true; // 启用平移  


let currentMesh;
let sclae = 30

var url1 = "./public/p1.png"
new THREE.TextureLoader().load(url1, texture => {
  var geometry = new THREE.SphereGeometry(10, 60, 60);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-200, 0, 0)
  scene.add(mesh);
});


var url2 = "./public/p2.png"
new THREE.TextureLoader().load(url2, texture => {
  var geometry = new THREE.SphereGeometry(10, 60, 60);
  geometry.scale(-1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(50, 0, 0)
  scene.add(mesh);
})


var url3 = "./public/p3.png"
new THREE.TextureLoader().load(url3, texture => {
  var geometry = new THREE.SphereGeometry(10, 60, 60);
  geometry.scale(-sclae, sclae, sclae);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0)
  scene.add(mesh);
  currentMesh = mesh
})


// 线条的高度就是，无人机的高度

var startpoint = new THREE.Vector3(50, -10000, 0)
var endpoint = new THREE.Vector3(50, 50, 0)
var line_1 = new THREE.Line3(
  new THREE.BufferGeometry().setFromPoints([startpoint, endpoint]),
  new THREE.LineDashedMaterial({
    color: 0xFF0000, // 线的颜色  
    dashSize: 10, // 虚线的线段长度  
    gapSize: 1  // 虚线的间隔长度  
  })
)
var geometry = new LineGeometry()
var pointArr = [
  50, -10000, 0,
  50, 50, 0,
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

// 渲染循环  
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();  