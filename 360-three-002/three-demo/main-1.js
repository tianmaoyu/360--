
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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


var geometry_1 = new THREE.SphereGeometry(10, 60, 60);
geometry_1.scale(-1, 1, 1);
var texture_1 = await new THREE.TextureLoader().loadAsync("./public/p1.png");
var material_1 = new THREE.MeshBasicMaterial({ map: texture_1 });
var mesh01 = new THREE.Mesh(geometry_1, material_1);
mesh01.position.set(-500, 0, 0)
scene.add(mesh01);

var geometry_2 = new THREE.SphereGeometry(10, 60, 60);
geometry_2.scale(-1, 1, 1);
var texture_2 = await new THREE.TextureLoader().loadAsync("./public/p2.png");
var material_2 = new THREE.MeshBasicMaterial({ map: texture_2 });
var mesh02 = new THREE.Mesh(geometry_2, material_2);
mesh02.position.set(50, 0, 0)
scene.add(mesh02);

var startpoint=new THREE.Vector3(50,0,0)
var endpoint=new THREE.Vector3(50,50,0)
var line_1 = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([startpoint, endpoint]),
  new THREE.LineDashedMaterial({
    color: 0x000000, // 线的颜色  
    dashSize: 0.2, // 虚线的线段长度  
    gapSize: 0.1  // 虚线的间隔长度  
  })
)
scene.add(line_1)

var circle = new THREE.Mesh(
  new THREE.CircleGeometry(3, 32),
  new THREE.MeshBasicMaterial({ color: 0x000000})
);  
circle.position.set(50, 0, 0)
circle.rotateX(-Math.PI/2)
scene.add(circle);  


var geometry_3 = new THREE.SphereGeometry(1000, 60, 60);
geometry_3.scale(-1, 1, 1);
var texture_3 = await new THREE.TextureLoader().loadAsync("./public/p3.png");
var material_3 = new THREE.MeshBasicMaterial({ map: texture_3 });
var mesh03 = new THREE.Mesh(geometry_3, material_3);
mesh03.position.set(0, 50, 0)
scene.add(mesh03);

// const loader=new THREE.TextureLoader()

// loader.load("./public/p3.png",(texture)=>{
//   var material_3 = new THREE.MeshBasicMaterial({ map: texture });
//   var mesh03 = new THREE.Mesh(geometry_3, material_3);
//   mesh03.position.set(0, 50, 0)
//   scene.add(mesh03);
// })
// var geometry = new THREE.BoxGeometry(100, 100, 100);
// var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
// var mesh = new THREE.Mesh(geometry, material);
// mesh.position.set(100, 0, 0)
// scene.add(mesh)

// 添加光源  
var ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光  
scene.add(ambientLight);

// var directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 平行光  
// directionalLight.position.set(1, 1, 1).normalize();  
// scene.add(directionalLight);  

camera.position.set(0, 0.11, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0))
// 渲染循环  
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();  
