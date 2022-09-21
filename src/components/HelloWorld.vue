<script setup lang="ts">
import { ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

import * as GeometryUtils from "three/examples/jsm/utils/GeometryUtils.js";

defineProps<{ msg: string }>();

let line, renderer, scene, camera, controls;

let matLine;

// viewport
let insetWidth;
let insetHeight;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(-40, 0, 60);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10;
  controls.maxDistance = 500;

  // Position and THREE.Color Data

  const positions = [];
  const colors = [];

  const points = GeometryUtils.hilbert3D(
    new THREE.Vector3(0, 0, 0),
    20.0,
    1,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7
  );

  const spline = new THREE.CatmullRomCurve3(points);
  const divisions = Math.round(12 * points.length);
  const point = new THREE.Vector3();
  const color = new THREE.Color();

  for (let i = 0, l = divisions; i < l; i++) {
    const t = i / l;

    spline.getPoint(t, point);
    positions.push(point.x, point.y, point.z);

    color.setHSL(t, 1.0, 0.5);
    colors.push(color.r, color.g, color.b);
  }

  // Line2 ( LineGeometry, LineMaterial )

  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);

  matLine = new LineMaterial({
    color: 0xffffff,
    linewidth: 5, // in world units with size attenuation, pixels otherwise
    vertexColors: true,

    //resolution:  // to be set by renderer, eventually
    dashed: false,
    alphaToCoverage: true,
  });

  line = new Line2(geometry, matLine);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);
  scene.add(line);
}

function animate() {
  requestAnimationFrame(animate);

  // main scene
}
</script>

<template>
  <!-- <h1>{{ msg }}</h1> -->
  <!-- <div
    id="three"
    style="
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      background-color: #d2d2d2;
    "
  ></div> -->
</template>

<style scoped></style>
