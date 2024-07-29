
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
scene.add(gridHelper);

var axesHelper1 = new THREE.AxesHelper(1000);
scene.add(axesHelper1);

var axesHelper2 = new THREE.AxesHelper(1000);

axesHelper2.position.set(10,50,10)
scene.add(axesHelper2);

// 添加鼠标控制  
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // 启用缩放  
controls.enablePan = true; // 启用平移  



// 添加光源  
var ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光  
scene.add(ambientLight);


camera.position.set(0, 100, 25);
camera.lookAt(new THREE.Vector3(0, 0, 0))


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