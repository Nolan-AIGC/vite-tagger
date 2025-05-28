import { parse } from "@babel/parser";
import { walk } from "estree-walker";
import MagicString from "magic-string";
import * as path from "path";
import { Plugin } from "vite";

export interface ViteTaggerOptions {
  /**
   * 是否启用插件（默认仅在开发模式启用）
   * Whether to enable the plugin (defaults to development mode only)
   */
  enabled?: boolean;
  /**
   * 自定义前缀名称（默认为 'vt'，对应 data-vt-id, data-vt-name 等）
   * Custom prefix name (defaults to 'vt', creates data-vt-id, data-vt-name, etc.)
   */
  prefixName?: string;
  /**
   * 包含的文件扩展名
   * File extensions to include
   */
  include?: string[];
  /**
   * 排除的文件路径模式
   * File path patterns to exclude
   */
  exclude?: string[];
  /**
   * 是否使用相对路径（默认 true）
   * Whether to use relative paths (defaults to true)
   */
  useRelativePath?: boolean;
  /**
   * 是否启用调试日志
   * Whether to enable debug logging
   */
  debug?: boolean;
  /**
   * 是否过滤 3D 元素 (three.js/drei)
   * Whether to filter 3D elements (three.js/drei)
   */
  filter3DElements?: boolean;
}

// Three.js 和 Drei 元素列表
const threeFiberElems = [
  "object3D",
  "audioListener",
  "positionalAudio",
  "mesh",
  "batchedMesh",
  "instancedMesh",
  "scene",
  "sprite",
  "lOD",
  "skinnedMesh",
  "skeleton",
  "bone",
  "lineSegments",
  "lineLoop",
  "points",
  "group",
  "camera",
  "perspectiveCamera",
  "orthographicCamera",
  "cubeCamera",
  "arrayCamera",
  "instancedBufferGeometry",
  "bufferGeometry",
  "boxBufferGeometry",
  "circleBufferGeometry",
  "coneBufferGeometry",
  "cylinderBufferGeometry",
  "dodecahedronBufferGeometry",
  "extrudeBufferGeometry",
  "icosahedronBufferGeometry",
  "latheBufferGeometry",
  "octahedronBufferGeometry",
  "planeBufferGeometry",
  "polyhedronBufferGeometry",
  "ringBufferGeometry",
  "shapeBufferGeometry",
  "sphereBufferGeometry",
  "tetrahedronBufferGeometry",
  "torusBufferGeometry",
  "torusKnotBufferGeometry",
  "tubeBufferGeometry",
  "wireframeGeometry",
  "tetrahedronGeometry",
  "octahedronGeometry",
  "icosahedronGeometry",
  "dodecahedronGeometry",
  "polyhedronGeometry",
  "tubeGeometry",
  "torusKnotGeometry",
  "torusGeometry",
  "sphereGeometry",
  "ringGeometry",
  "planeGeometry",
  "latheGeometry",
  "shapeGeometry",
  "extrudeGeometry",
  "edgesGeometry",
  "coneGeometry",
  "cylinderGeometry",
  "circleGeometry",
  "boxGeometry",
  "capsuleGeometry",
  "material",
  "shadowMaterial",
  "spriteMaterial",
  "rawShaderMaterial",
  "shaderMaterial",
  "pointsMaterial",
  "meshPhysicalMaterial",
  "meshStandardMaterial",
  "meshPhongMaterial",
  "meshToonMaterial",
  "meshNormalMaterial",
  "meshLambertMaterial",
  "meshDepthMaterial",
  "meshDistanceMaterial",
  "meshBasicMaterial",
  "meshMatcapMaterial",
  "lineDashedMaterial",
  "lineBasicMaterial",
  "primitive",
  "light",
  "spotLightShadow",
  "spotLight",
  "pointLight",
  "rectAreaLight",
  "hemisphereLight",
  "directionalLightShadow",
  "directionalLight",
  "ambientLight",
  "lightShadow",
  "ambientLightProbe",
  "hemisphereLightProbe",
  "lightProbe",
  "spotLightHelper",
  "skeletonHelper",
  "pointLightHelper",
  "hemisphereLightHelper",
  "gridHelper",
  "polarGridHelper",
  "directionalLightHelper",
  "cameraHelper",
  "boxHelper",
  "box3Helper",
  "planeHelper",
  "arrowHelper",
  "axesHelper",
  "texture",
  "videoTexture",
  "dataTexture",
  "dataTexture3D",
  "compressedTexture",
  "cubeTexture",
  "canvasTexture",
  "depthTexture",
  "raycaster",
  "vector2",
  "vector3",
  "vector4",
  "euler",
  "matrix3",
  "matrix4",
  "quaternion",
  "bufferAttribute",
  "float16BufferAttribute",
  "float32BufferAttribute",
  "float64BufferAttribute",
  "int8BufferAttribute",
  "int16BufferAttribute",
  "int32BufferAttribute",
  "uint8BufferAttribute",
  "uint16BufferAttribute",
  "uint32BufferAttribute",
  "instancedBufferAttribute",
  "color",
  "fog",
  "fogExp2",
  "shape",
  "colorShiftMaterial",
];

const dreiElems = [
  "AsciiRenderer",
  "Billboard",
  "Clone",
  "ComputedAttribute",
  "Decal",
  "Edges",
  "Effects",
  "GradientTexture",
  "Image",
  "MarchingCubes",
  "Outlines",
  "PositionalAudio",
  "Sampler",
  "ScreenSizer",
  "ScreenSpace",
  "Splat",
  "Svg",
  "Text",
  "Text3D",
  "Trail",
  "CubeCamera",
  "OrthographicCamera",
  "PerspectiveCamera",
  "CameraControls",
  "FaceControls",
  "KeyboardControls",
  "MotionPathControls",
  "PresentationControls",
  "ScrollControls",
  "DragControls",
  "GizmoHelper",
  "Grid",
  "Helper",
  "PivotControls",
  "TransformControls",
  "CubeTexture",
  "Fbx",
  "Gltf",
  "Ktx2",
  "Loader",
  "Progress",
  "ScreenVideoTexture",
  "Texture",
  "TrailTexture",
  "VideoTexture",
  "WebcamVideoTexture",
  "CycleRaycast",
  "DetectGPU",
  "Example",
  "FaceLandmarker",
  "Fbo",
  "Html",
  "Select",
  "SpriteAnimator",
  "StatsGl",
  "Stats",
  "Trail",
  "Wireframe",
  "CurveModifier",
  "AdaptiveDpr",
  "AdaptiveEvents",
  "BakeShadows",
  "Bvh",
  "Detailed",
  "Instances",
  "Merged",
  "meshBounds",
  "PerformanceMonitor",
  "Points",
  "Preload",
  "Segments",
  "Fisheye",
  "Hud",
  "Mask",
  "MeshPortalMaterial",
  "RenderCubeTexture",
  "RenderTexture",
  "View",
  "MeshDiscardMaterial",
  "MeshDistortMaterial",
  "MeshReflectorMaterial",
  "MeshRefractionMaterial",
  "MeshTransmissionMaterial",
  "MeshWobbleMaterial",
  "PointMaterial",
  "shaderMaterial",
  "SoftShadows",
  "CatmullRomLine",
  "CubicBezierLine",
  "Facemesh",
  "Line",
  "Mesh",
  "QuadraticBezierLine",
  "RoundedBox",
  "ScreenQuad",
  "AccumulativeShadows",
  "Backdrop",
  "BBAnchor",
  "Bounds",
  "CameraShake",
  "Caustics",
  "Center",
  "Cloud",
  "ContactShadows",
  "Environment",
  "Float",
  "Lightformer",
  "MatcapTexture",
  "NormalTexture",
  "RandomizedLight",
  "Resize",
  "ShadowAlpha",
  "Shadow",
  "Sky",
  "Sparkles",
  "SpotLightShadow",
  "SpotLight",
  "Stage",
  "Stars",
  "OrbitControls",
];

function shouldTagElement(
  elementName: string,
  filter3DElements: boolean
): boolean {
  if (!filter3DElements) return true;
  return (
    !threeFiberElems.includes(elementName) && !dreiElems.includes(elementName)
  );
}

/**
 * Vite Tagger Plugin
 *
 * Automatically adds debug attributes to JSX elements for development.
 * Helps with element identification and debugging in the browser.
 */
export function viteTagger(options: ViteTaggerOptions = {}): Plugin {
  const {
    enabled,
    prefixName = "vt",
    include = [".tsx", ".jsx"],
    exclude = ["node_modules"],
    useRelativePath = true,
    debug = false,
    filter3DElements = true,
  } = options;

  // 统计信息
  const stats = {
    totalFiles: 0,
    processedFiles: 0,
    totalElements: 0,
    skippedElements: 0,
  };

  return {
    name: "vite-tagger",
    enforce: "pre",
    async transform(code: string, id: string) {
      // 检查是否启用
      const shouldEnable =
        enabled !== undefined
          ? enabled
          : process.env.NODE_ENV === "development";
      if (!shouldEnable) return null;

      // 检查文件扩展名
      const hasValidExtension = include.some((ext) => id.endsWith(ext));
      if (!hasValidExtension) return null;

      // 检查排除模式
      const isExcluded = exclude.some((pattern) => id.includes(pattern));
      if (isExcluded) return null;

      stats.totalFiles++;
      const relativePath = useRelativePath ? getRelativePath(id) : id;

      if (debug) {
        console.log(`[vite-tagger] Processing: ${relativePath}`);
      }

      try {
        // 解析代码为 AST
        const ast = parse(code, {
          sourceType: "module" as const,
          plugins: ["typescript", "jsx"],
        });

        const s = new MagicString(code);
        let hasChanges = false;
        let elementCount = 0;

        // 遍历 AST
        walk(ast as any, {
          enter(node: any, parent: any) {
            if (node.type === "JSXOpeningElement") {
              const jsxNode = node;
              let elementName: string;

              // 获取元素名称
              if (jsxNode.name.type === "JSXIdentifier") {
                elementName = jsxNode.name.name;
              } else if (jsxNode.name.type === "JSXMemberExpression") {
                const memberExpr = jsxNode.name;
                elementName = `${memberExpr.object.name}.${memberExpr.property.name}`;
              } else {
                return;
              }

              // 跳过 Fragment
              if (
                elementName === "Fragment" ||
                elementName === "React.Fragment"
              ) {
                return;
              }

              // 检查是否应该标记此元素
              const shouldTag = shouldTagElement(elementName, filter3DElements);
              if (!shouldTag) {
                stats.skippedElements++;
                return;
              }

              // 检查是否是 HTML 元素（小写开头）
              if (elementName[0] !== elementName[0].toLowerCase()) {
                return; // 跳过 React 组件
              }

              elementCount++;

              // 检查是否已经有主要属性
              const mainAttrName = `data-${prefixName}-id`;
              const hasMainAttr = jsxNode.attributes.some(
                (attr: any) =>
                  attr.type === "JSXAttribute" &&
                  attr.name?.type === "JSXIdentifier" &&
                  attr.name.name === mainAttrName
              );

              if (!hasMainAttr) {
                // 提取属性信息
                const attributes: Record<string, string> = {};
                jsxNode.attributes.forEach((attr: any) => {
                  if (
                    attr.type === "JSXAttribute" &&
                    attr.name?.type === "JSXIdentifier"
                  ) {
                    const attrName = attr.name.name;
                    if (attr.value?.type === "Literal") {
                      attributes[attrName] = attr.value.value;
                    } else if (
                      attr.value?.type === "JSXExpressionContainer" &&
                      attr.value.expression?.type === "Literal"
                    ) {
                      attributes[attrName] = attr.value.expression.value;
                    }
                  }
                });

                // 提取文本内容
                let textContent = "";
                if (parent?.children) {
                  const extractTextFromNode = (child: any): string => {
                    if (child.type === "JSXText") {
                      return child.value.trim();
                    } else if (child.type === "JSXExpressionContainer") {
                      if (child.expression?.type === "Literal") {
                        return String(child.expression.value);
                      } else if (child.expression?.type === "TemplateLiteral") {
                        // 处理模板字符串
                        return child.expression.quasis
                          .map((q: any) => q.value.raw)
                          .join("");
                      }
                    } else if (child.type === "JSXElement") {
                      // 递归处理嵌套的 JSX 元素中的文本
                      if (child.children) {
                        return child.children
                          .map(extractTextFromNode)
                          .filter(Boolean)
                          .join(" ");
                      }
                    }
                    return "";
                  };

                  textContent = parent.children
                    .map(extractTextFromNode)
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                }

                // 构建内容对象
                const content: Record<string, any> = {};
                if (textContent) {
                  content.text = textContent;
                }
                if (attributes.placeholder) {
                  content.placeholder = attributes.placeholder;
                }
                if (attributes.className) {
                  content.className = attributes.className;
                }
                if (attributes.id) {
                  content.id = attributes.id;
                }
                if (attributes.title) {
                  content.title = attributes.title;
                }
                if (attributes.alt) {
                  content.alt = attributes.alt;
                }

                // 获取位置信息
                const line = jsxNode.loc?.start?.line ?? 0;
                const col = jsxNode.loc?.start?.column ?? 0;
                const fileName = path.basename(id);

                // 构建主ID
                const dataComponentId = `${relativePath}:${line}:${col}`;

                // 检查content是否为空对象
                const isContentEmpty = Object.keys(content).length === 0;

                // 构建 Legacy 属性
                const legacyAttrs = [
                  `data-component-path="${relativePath}"`,
                  `data-component-line="${line}"`,
                  `data-component-file="${fileName}"`,
                  `data-component-name="${elementName}"`,
                  // 只有在content非空时才添加data-component-content属性
                  ...(isContentEmpty
                    ? []
                    : [
                        `data-component-content="${encodeURIComponent(
                          JSON.stringify(content)
                        )}"`,
                      ]),
                ].join(" ");

                // 构建完整的属性字符串
                const attrString = ` data-${prefixName}-id="${dataComponentId}" data-${prefixName}-name="${elementName}" ${legacyAttrs}`;

                // 在标签名后添加属性
                const tagNameEnd = jsxNode.name.end!;
                s.appendLeft(tagNameEnd, attrString);

                hasChanges = true;

                if (debug) {
                  console.log(
                    `[vite-tagger] Added data-${prefixName}-id="${dataComponentId}" to <${elementName}>`
                  );
                  console.log(`[vite-tagger] Content extracted:`, content);
                }
              }
            }
          },
        });

        stats.processedFiles++;
        stats.totalElements += elementCount;

        if (debug) {
          console.log(
            `[vite-tagger] Found ${elementCount} HTML elements in ${relativePath}, ${
              hasChanges ? "made changes" : "no changes needed"
            }`
          );
        }

        if (hasChanges) {
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true }),
          };
        }
      } catch (error) {
        console.warn(`[vite-tagger] Failed to process ${relativePath}:`, error);
        stats.processedFiles++;
      }

      return null;
    },

    // 添加构建结束时的统计信息
    buildEnd() {
      if (debug) {
        console.log(`\n[vite-tagger] Build Statistics:`);
        console.log(`  Total files scanned: ${stats.totalFiles}`);
        console.log(`  Files processed: ${stats.processedFiles}`);
        console.log(`  HTML elements tagged: ${stats.totalElements}`);
        console.log(`  3D elements skipped: ${stats.skippedElements}`);
      }
    },
  };
}

/**
 * 获取相对于项目根目录的路径
 * Get path relative to project root
 */
function getRelativePath(absolutePath: string): string {
  const cwd = process.cwd();
  return path.relative(cwd, absolutePath).replace(/\\/g, "/");
}

// 默认导出
export default viteTagger;
