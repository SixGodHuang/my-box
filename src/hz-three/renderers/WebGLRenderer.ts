import {
  BackSide,
  DoubleSide,
  FrontSide,
  RGBAFormat,
  HalfFloatType,
  FloatType,
  UnsignedByteType,
  LinearEncoding,
  NoToneMapping,
  LinearMipmapLinearFilter,
  NearestFilter,
  ClampToEdgeWrapping,
} from "../constants";

function createCanvasElement() {
  const canvas = document.createElementNS(
    "http://www.w3.org/1999/xhtml",
    "canvas"
  );
  canvas.style.display = "block";
  return canvas;
}

class WebGLRenderer {
  domElement;
  debug;

  // clearing

  autoClear = true;
  autoClearColor = true;
  autoClearDepth = true;
  autoClearStencil = true;

  // scene graph
  sortObjects = true;
  clippingPlanes = [];
  localClippingEnabled = false;

  // physically based shading

  gammaFactor = 2.0; // for backwards compatibility
  outputEncoding = LinearEncoding;

  // physical lights

  physicallyCorrectLights = false;

  // tone mapping

  toneMapping = NoToneMapping;
  toneMappingExposure = 1.0;

  constructor(parameters: any = {}) {
    const _canvas =
        parameters.canvas !== undefined
          ? parameters.canvas
          : createCanvasElement(),
      _context = parameters.context !== undefined ? parameters.context : null,
      _alpha = parameters.alpha !== undefined ? parameters.alpha : false,
      _depth = parameters.depth !== undefined ? parameters.depth : true,
      _stencil = parameters.stencil !== undefined ? parameters.stencil : true,
      _antialias =
        parameters.antialias !== undefined ? parameters.antialias : false,
      _premultipliedAlpha =
        parameters.premultipliedAlpha !== undefined
          ? parameters.premultipliedAlpha
          : true,
      _preserveDrawingBuffer =
        parameters.preserveDrawingBuffer !== undefined
          ? parameters.preserveDrawingBuffer
          : false,
      _powerPreference =
        parameters.powerPreference !== undefined
          ? parameters.powerPreference
          : "default",
      _failIfMajorPerformanceCaveat =
        parameters.failIfMajorPerformanceCaveat !== undefined
          ? parameters.failIfMajorPerformanceCaveat
          : false;

    let currentRenderList = null;
    let currentRenderState = null;
    // render() can be called from within a callback triggered by another render.
    // We track this so that the nested render call gets its list and state isolated from the parent render call.

    const renderListStack = [];
    const renderStateStack = [];

    // public properties

    this.domElement = _canvas;

    // Debug configuration container
    this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: true,
    };
  }
}

export { WebGLRenderer };
