
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'


import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';


// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 40); //设置相机位置
camera.lookAt(new THREE.Vector3(0, 0, 0))

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const font = new FontLoader().parse(THREE.FontUtils.json('helvetiker_regular'));
debugger
// 加载字体 SimHei_Regular.json
//helvetiker_regular.typeface.json
const loader = new FontLoader();
loader.load('font/SimHei_Regular.json', function (font) {
    // 创建文本几何体
    // const geometry = new TextGeometry('你好!hello world', {
    //     font: font,
    //     size: 100,
    //     height: 5,
    //     curveSegments: 12,
    //     bevelEnabled: true,
    //     bevelThickness: 10,
    //     bevelSize: 2,
    //     bevelSegments: 5

    // });
    const geometry = new TextGeometry('你好!hello world',{
        font: font,
        height: 20,
    });

    // 创建材质
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.scale.set(0.1,0.1,0.1);
    // 将文本网格添加到场景中
    scene.add(textMesh);
});

// 渲染场景
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
// 窗口大小改变时调整渲染器大小
window.addEventListener('resize', onWindowResize, false);
new OrbitControls(camera, renderer.domElement);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}