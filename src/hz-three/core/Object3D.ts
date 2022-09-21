import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Matrix4 } from "../math/Matrix4";
import { EventDispatcher } from "./EventDispatcher";
import { Euler } from "../math/Euler";
import { Layers } from "./Layers";
import { Matrix3 } from "../math/Matrix3";

import * as MathUtils from "../math/MathUtils";

let _object3DId = 0;

const _addedEvent = { type: "added" };
const _removedEvent = { type: "removed" };

class Object3D extends EventDispatcher {
  isObject3D = true;
  DefaultMatrixAutoUpdate = true;
  DefaultUp = new Vector3(0, 1, 0);
  isCamera: any;
  isLight: any;
  isInstancedMesh: any;
  isScene: any;
  isMesh: any;
  isLine: any;
  isPoints: any;
  isSkinnedMesh: any;

  bindMode: any;
  bindMatrix: any;
  skeleton: any;

  _v1 = /*@__PURE__*/ new Vector3();
  _q1 = /*@__PURE__*/ new Quaternion();
  _m1 = /*@__PURE__*/ new Matrix4();
  _target = /*@__PURE__*/ new Vector3();

  _position = /*@__PURE__*/ new Vector3();
  _scale = /*@__PURE__*/ new Vector3();
  _quaternion = /*@__PURE__*/ new Quaternion();

  _xAxis = /*@__PURE__*/ new Vector3(1, 0, 0);
  _yAxis = /*@__PURE__*/ new Vector3(0, 1, 0);
  _zAxis = /*@__PURE__*/ new Vector3(0, 0, 1);

  uuid: any;
  name: string;
  type: string;
  parent: any;
  children: any;

  up: any;

  position: any;
  quaternion: any;
  scale: any;
  rotation: any;

  matrix: any;
  matrixWorld;
  matrixAutoUpdate;
  matrixWorldNeedsUpdate;
  layers;
  visible;
  castShadow;
  receiveShadow;
  frustumCulled;
  renderOrder;
  animations: any;
  userData;

  count: any;
  instanceMatrix: any;
  instanceColor: any;
  background: any;
  environment: any;
  geometry: any;
  material: any;

  constructor() {
    super();

    Object.defineProperty(this, "id", { value: _object3DId++ });

    this.uuid = MathUtils.generateUUID();

    this.name = "";
    this.type = "Object3D";

    this.parent = null;
    this.children = [];

    this.up = this.DefaultUp.clone();

    const position = new Vector3();
    const rotation = new Euler();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);

    function onRotationChange() {
      quaternion.setFromEuler(rotation, false);
    }

    function onQuaternionChange() {
      rotation.setFromQuaternion(quaternion, undefined, false);
    }

    rotation._onChange(onRotationChange);
    quaternion._onChange(onQuaternionChange);

    Object.defineProperties(this, {
      position: {
        configurable: true,
        enumerable: true,
        value: position,
      },
      rotation: {
        configurable: true,
        enumerable: true,
        value: rotation,
      },
      quaternion: {
        configurable: true,
        enumerable: true,
        value: quaternion,
      },
      scale: {
        configurable: true,
        enumerable: true,
        value: scale,
      },
      modelViewMatrix: {
        value: new Matrix4(),
      },
      normalMatrix: {
        value: new Matrix3(),
      },
    });

    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();

    this.matrixAutoUpdate = this.DefaultMatrixAutoUpdate;
    this.matrixWorldNeedsUpdate = false;

    this.layers = new Layers();
    this.visible = true;

    this.castShadow = false;
    this.receiveShadow = false;

    this.frustumCulled = true;
    this.renderOrder = 0;

    this.animations = [];

    this.userData = {};
  }

  onBeforeRender() {}
  onAfterRender() {}

  applyMatrix4(matrix: any) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    this.matrix.premultiply(matrix);

    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }

  applyQuaternion(q: any) {
    this.quaternion.premultiply(q);

    return this;
  }

  setRotationFromAxisAngle(axis: any, angle: any) {
    // assumes axis is normalized

    this.quaternion.setFromAxisAngle(axis, angle);
  }

  setRotationFromEuler(euler: any) {
    this.quaternion.setFromEuler(euler, true);
  }

  setRotationFromMatrix(m: any) {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    this.quaternion.setFromRotationMatrix(m);
  }

  setRotationFromQuaternion(q: any) {
    // assumes q is normalized

    this.quaternion.copy(q);
  }

  rotateOnAxis(axis: any, angle: any) {
    // rotate object on axis in object space
    // axis is assumed to be normalized

    this._q1.setFromAxisAngle(axis, angle);

    this.quaternion.multiply(this._q1);

    return this;
  }

  rotateOnWorldAxis(axis: any, angle: any) {
    // rotate object on axis in world space
    // axis is assumed to be normalized
    // method assumes no rotated parent

    this._q1.setFromAxisAngle(axis, angle);

    this.quaternion.premultiply(this._q1);

    return this;
  }

  rotateX(angle: any) {
    return this.rotateOnAxis(this._xAxis, angle);
  }

  rotateY(angle: any) {
    return this.rotateOnAxis(this._yAxis, angle);
  }

  rotateZ(angle: any) {
    return this.rotateOnAxis(this._zAxis, angle);
  }

  translateOnAxis(axis: any, distance: any) {
    // translate object by distance along axis in object space
    // axis is assumed to be normalized

    this._v1.copy(axis).applyQuaternion(this.quaternion);

    this.position.add(this._v1.multiplyScalar(distance));

    return this;
  }

  translateX(distance: number) {
    return this.translateOnAxis(this._xAxis, distance);
  }

  translateY(distance: number) {
    return this.translateOnAxis(this._yAxis, distance);
  }

  translateZ(distance: number) {
    return this.translateOnAxis(this._zAxis, distance);
  }

  localToWorld(vector: Vector3) {
    return vector.applyMatrix4(this.matrixWorld);
  }

  worldToLocal(vector: Vector3) {
    return vector.applyMatrix4(this._m1.copy(this.matrixWorld).invert());
  }

  lookAt(x: any, y: any, z: any) {
    // This method does not support objects having non-uniformly-scaled parent(s)

    if (x.isVector3) {
      this._target.copy(x);
    } else {
      this._target.set(x, y, z);
    }

    const parent = this.parent;

    this.updateWorldMatrix(true, false);

    this._position.setFromMatrixPosition(this.matrixWorld);

    if (this.isCamera || this.isLight) {
      this._m1.lookAt(this._position, this._target, this.up);
    } else {
      this._m1.lookAt(this._target, this._position, this.up);
    }

    this.quaternion.setFromRotationMatrix(this._m1);

    if (parent) {
      this._m1.extractRotation(parent.matrixWorld);
      this._q1.setFromRotationMatrix(this._m1);
      this.quaternion.premultiply(this._q1.invert());
    }
  }

  add(object: any) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }

      return this;
    }

    if (object === this) {
      console.error(
        "THREE.Object3D.add: object can't be added as a child of itself.",
        object
      );
      return this;
    }

    if (object && object.isObject3D) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }

      object.parent = this;
      this.children.push(object);

      object.dispatchEvent(_addedEvent);
    } else {
      console.error(
        "THREE.Object3D.add: object not an instance of THREE.Object3D.",
        object
      );
    }

    return this;
  }

  remove(object: any) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }

      return this;
    }

    const index = this.children.indexOf(object);

    if (index !== -1) {
      object.parent = null;
      this.children.splice(index, 1);

      object.dispatchEvent(_removedEvent);
    }

    return this;
  }

  removeFromParent() {
    const parent = this.parent;

    if (parent !== null) {
      parent.remove(this);
    }

    return this;
  }

  clear() {
    for (let i = 0; i < this.children.length; i++) {
      const object = this.children[i];

      object.parent = null;

      object.dispatchEvent(_removedEvent);
    }

    this.children.length = 0;

    return this;
  }

  attach(object: any) {
    // adds object as a child of this, while maintaining the object's world transform

    this.updateWorldMatrix(true, false);

    this._m1.copy(this.matrixWorld).invert();

    if (object.parent !== null) {
      object.parent.updateWorldMatrix(true, false);

      this._m1.multiply(object.parent.matrixWorld);
    }

    object.applyMatrix4(this._m1);

    this.add(object);

    object.updateWorldMatrix(false, true);

    return this;
  }

  getObjectById(id: string) {
    return this.getObjectByProperty("id", id);
  }

  getObjectByName(name: string) {
    return this.getObjectByProperty("name", name);
  }

  getObjectByProperty(name: string, value: string) {
    if ((this as any)[name] === value) return this;

    for (let i = 0, l = this.children.length; i < l; i++) {
      const child = this.children[i];
      const object = child.getObjectByProperty(name, value);

      if (object !== undefined) {
        return object;
      }
    }

    return undefined;
  }

  getWorldPosition(target: any) {
    this.updateWorldMatrix(true, false);

    return target.setFromMatrixPosition(this.matrixWorld);
  }

  getWorldQuaternion(target: any) {
    this.updateWorldMatrix(true, false);

    this.matrixWorld.decompose(this._position, target, this._scale);

    return target;
  }

  getWorldScale(target: any) {
    this.updateWorldMatrix(true, false);

    this.matrixWorld.decompose(this._position, this._quaternion, target);

    return target;
  }

  getWorldDirection(target: any) {
    this.updateWorldMatrix(true, false);

    const e = this.matrixWorld.elements;

    return target.set(e[8], e[9], e[10]).normalize();
  }

  raycast() {}

  traverse(callback: any) {
    callback(this);

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverse(callback);
    }
  }

  traverseVisible(callback: any) {
    if (this.visible === false) return;

    callback(this);

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverseVisible(callback);
    }
  }

  traverseAncestors(callback: any) {
    const parent = this.parent;

    if (parent !== null) {
      callback(parent);

      parent.traverseAncestors(callback);
    }
  }

  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);

    this.matrixWorldNeedsUpdate = true;
  }

  updateMatrixWorld(force: any) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.matrixWorldNeedsUpdate || force) {
      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;

      force = true;
    }

    // update children

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].updateMatrixWorld(force);
    }
  }

  updateWorldMatrix(updateParents: any, updateChildren: any) {
    const parent = this.parent;

    if (updateParents === true && parent !== null) {
      parent.updateWorldMatrix(true, false);
    }

    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.parent === null) {
      this.matrixWorld.copy(this.matrix);
    } else {
      this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
    }

    // update children

    if (updateChildren === true) {
      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        children[i].updateWorldMatrix(false, true);
      }
    }
  }

  toJSON(meta: any) {
    // meta is a string when called from JSON.stringify
    const isRootObject = meta === undefined || typeof meta === "string";

    const output: any = {};

    // meta is a hash used to collect geometries, materials.
    // not providing it implies that this is the root object
    // being serialized.
    if (isRootObject) {
      // initialize meta obj
      meta = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
      };

      output.metadata = {
        version: 4.5,
        type: "Object",
        generator: "Object3D.toJSON",
      };
    }

    // standard Object3D serialization

    const object: any = {};

    object.uuid = this.uuid;
    object.type = this.type;

    if (this.name !== "") object.name = this.name;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;
    if (this.frustumCulled === false) object.frustumCulled = false;
    if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
    if (JSON.stringify(this.userData) !== "{}") object.userData = this.userData;

    object.layers = this.layers.mask;
    object.matrix = this.matrix.toArray();

    if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

    // object specific properties

    if (this.isInstancedMesh) {
      object.type = "InstancedMesh";
      object.count = this.count;
      object.instanceMatrix = this.instanceMatrix.toJSON();
      if (this.instanceColor !== null)
        object.instanceColor = this.instanceColor.toJSON();
    }

    //

    function serialize(library: any, element: any) {
      if (library[element.uuid] === undefined) {
        library[element.uuid] = element.toJSON(meta);
      }

      return element.uuid;
    }

    if (this.isScene) {
      if (this.background) {
        if (this.background.isColor) {
          object.background = this.background.toJSON();
        } else if (this.background.isTexture) {
          object.background = this.background.toJSON(meta).uuid;
        }
      }

      if (this.environment && this.environment.isTexture) {
        object.environment = this.environment.toJSON(meta).uuid;
      }
    } else if (this.isMesh || this.isLine || this.isPoints) {
      object.geometry = serialize(meta.geometries, this.geometry);

      const parameters = this.geometry.parameters;

      if (parameters !== undefined && parameters.shapes !== undefined) {
        const shapes = parameters.shapes;

        if (Array.isArray(shapes)) {
          for (let i = 0, l = shapes.length; i < l; i++) {
            const shape = shapes[i];

            serialize(meta.shapes, shape);
          }
        } else {
          serialize(meta.shapes, shapes);
        }
      }
    }

    if (this.isSkinnedMesh) {
      object.bindMode = this.bindMode;
      object.bindMatrix = this.bindMatrix.toArray();

      if (this.skeleton !== undefined) {
        serialize(meta.skeletons, this.skeleton);

        object.skeleton = this.skeleton.uuid;
      }
    }

    if (this.material !== undefined) {
      if (Array.isArray(this.material)) {
        const uuids = [];

        for (let i = 0, l = this.material.length; i < l; i++) {
          uuids.push(serialize(meta.materials, this.material[i]));
        }

        object.material = uuids;
      } else {
        object.material = serialize(meta.materials, this.material);
      }
    }

    //

    if (this.children.length > 0) {
      object.children = [];

      for (let i = 0; i < this.children.length; i++) {
        object.children.push(this.children[i].toJSON(meta).object);
      }
    }

    //

    if (this.animations.length > 0) {
      object.animations = [];

      for (let i = 0; i < this.animations.length; i++) {
        const animation = this.animations[i];

        object.animations.push(serialize(meta.animations, animation));
      }
    }

    if (isRootObject) {
      const geometries = extractFromCache(meta.geometries);
      const materials = extractFromCache(meta.materials);
      const textures = extractFromCache(meta.textures);
      const images = extractFromCache(meta.images);
      const shapes = extractFromCache(meta.shapes);
      const skeletons = extractFromCache(meta.skeletons);
      const animations = extractFromCache(meta.animations);

      if (geometries.length > 0) output.geometries = geometries;
      if (materials.length > 0) output.materials = materials;
      if (textures.length > 0) output.textures = textures;
      if (images.length > 0) output.images = images;
      if (shapes.length > 0) output.shapes = shapes;
      if (skeletons.length > 0) output.skeletons = skeletons;
      if (animations.length > 0) output.animations = animations;
    }

    output.object = object;

    return output;

    // extract data from the cache hash
    // remove metadata on each item
    // and return as array
    function extractFromCache(cache: any) {
      const values = [];
      for (const key in cache) {
        const data = cache[key];
        delete data.metadata;
        values.push(data);
      }

      return values;
    }
  }

  clone(recursive: any) {
    return new Object3D().copy(this, recursive);
  }

  copy(source: any, recursive = true) {
    this.name = source.name;

    this.up.copy(source.up);

    this.position.copy(source.position);
    this.rotation.order = source.rotation.order;
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);

    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.userData = JSON.parse(JSON.stringify(source.userData));

    if (recursive === true) {
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i];
        this.add(child.clone());
      }
    }

    return this;
  }
}

export { Object3D };
