import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

import Three from 'three.js'




var scene = new Three.Scene();
var camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1100);
camera.position.set(0, 0, 2000);
camera.lookAt(new Three.Vector3(0, 0, 0));

var renderer = new Three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
var container = document.getElementById('app');
container.appendChild(renderer.domElement);

animate()

// 实时渲染
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}