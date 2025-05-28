# vite-tagger

<div align="center">
  <img src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png" alt="npm logo" width="200" />
  
  <p>A Vite plugin that automatically adds debug attributes to JSX elements for development</p>
  
  <p>
    <a href="https://www.npmjs.com/package/vite-tagger">
      <img src="https://img.shields.io/npm/v/vite-tagger.svg" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/vite-tagger">
      <img src="https://img.shields.io/npm/dm/vite-tagger.svg" alt="npm downloads" />
    </a>
    <a href="https://github.com/kcsx/vite-tagger/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/vite-tagger.svg" alt="license" />
    </a>
  </p>
</div>

## 🚀 Features

- ✅ **Automatic Debug Attributes**: Adds `data-vt-id`, `data-vt-name` and other debug attributes to JSX elements
- 🎯 **Element Tracing**: Includes file path, line number, and column information for easy element location
- 🔍 **DevTools Friendly**: Enhances browser developer tools debugging experience
- 🎨 **3D Framework Support**: Intelligently filters Three.js and Drei elements
- ⚡ **Development Mode Only**: Runs only in development mode by default
- 🛠️ **Highly Configurable**: Custom prefixes, include/exclude patterns, and more
- 🎛️ **Customizable Attributes**: Control which debug attributes are added to elements
- 📦 **Zero Runtime**: Does not affect production builds
- 🌏 **TypeScript Support**: Full TypeScript support and type definitions

## 📦 Installation

```bash
npm install vite-tagger --save-dev
# or
yarn add vite-tagger --dev
# or
pnpm add vite-tagger --save-dev
```

## 🔧 Usage

### Basic Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteTagger } from "vite-tagger";

export default defineConfig({
  plugins: [react(), viteTagger()],
});
```

### Advanced Configuration

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteTagger } from "vite-tagger";

export default defineConfig({
  plugins: [
    react(),
    viteTagger({
      // Custom debug attribute prefix
      prefixName: "my-debug",
      // Enable debug logging
      debug: true,
      // Include additional file extensions
      include: [".tsx", ".jsx", ".mdx"],
      // Exclude specific paths
      exclude: ["node_modules", "dist", "build"],
      // Use absolute paths
      useRelativePath: false,
      // Disable 3D element filtering
      filter3DElements: false,
      // Force enable in production (not recommended)
      enabled: true,
      // Custom attributes to include
      attributesToInclude: ["id", "name", "line"],
    }),
  ],
});
```

## 🎯 How It Works

### Before

```jsx
function App() {
  return (
    <div className='container'>
      <h1>Hello World</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

### After (in development)

```jsx
function App() {
  return (
    <div
      className='container'
      data-vt-id='src/App.tsx:3:4'
      data-vt-name='div'
      data-component-path='src/App.tsx'
      data-component-line='3'
      data-component-file='App.tsx'
      data-component-name='div'
      data-component-content='%7B%22className%22%3A%22container%22%7D'
    >
      <h1
        data-vt-id='src/App.tsx:4:6'
        data-vt-name='h1'
        data-component-path='src/App.tsx'
        data-component-line='4'
        data-component-file='App.tsx'
        data-component-name='h1'
        data-component-content='%7B%22text%22%3A%22Hello%20World%22%7D'
      >
        Hello World
      </h1>
      <button
        onClick={handleClick}
        data-vt-id='src/App.tsx:5:6'
        data-vt-name='button'
        data-component-path='src/App.tsx'
        data-component-line='5'
        data-component-file='App.tsx'
        data-component-name='button'
        data-component-content='%7B%22text%22%3A%22Click%20me%22%7D'
      >
        Click me
      </button>
    </div>
  );
}
```

## ⚙️ Configuration Options

| Option                | Type       | Default                                             | Description                           |
| --------------------- | ---------- | --------------------------------------------------- | ------------------------------------- |
| `enabled`             | `boolean`  | `NODE_ENV === 'development'`                        | Whether to enable the plugin          |
| `prefixName`          | `string`   | `'vt'`                                              | Custom prefix for debug attributes    |
| `include`             | `string[]` | `['.tsx', '.jsx']`                                  | File extensions to process            |
| `exclude`             | `string[]` | `['node_modules']`                                  | Paths to exclude                      |
| `useRelativePath`     | `boolean`  | `true`                                              | Use relative paths in debug info      |
| `debug`               | `boolean`  | `false`                                             | Enable debug logging                  |
| `filter3DElements`    | `boolean`  | `true`                                              | Filter out Three.js/Drei elements     |
| `attributesToInclude` | `string[]` | `['id', 'name', 'path', 'line', 'file', 'content']` | Attributes to include in debug output |

## 🎨 Debug Attributes Explained

The plugin adds these debug attributes to help with development:

### Primary Attributes

- `data-{prefix}-id`: Unique identifier with path and position (`path:line:col`)
- `data-{prefix}-name`: Element tag name

### Legacy Attributes (for compatibility)

- `data-component-path`: File path
- `data-component-line`: Line number
- `data-component-file`: File name
- `data-component-name`: Element name
- `data-component-content`: Encoded element content (text, class names, placeholders)

Note: `data-component-content` is only added when there's actual content to display.

### Customizing Attributes

You can control which attributes are included using the `attributesToInclude` option:

```javascript
viteTagger({
  // Only include ID and name attributes
  attributesToInclude: ["id", "name"],
});
```

Available attribute keys:

- `'id'`: Adds `data-{prefix}-id` attribute
- `'name'`: Adds `data-{prefix}-name` and `data-component-name` attributes
- `'path'`: Adds `data-component-path` attribute
- `'line'`: Adds `data-component-line` attribute
- `'file'`: Adds `data-component-file` attribute
- `'content'`: Adds `data-component-content` attribute (when content exists)

By default, all attributes are included.

## 🌍 Framework Support

Works with any Vite project using JSX:

- ⚛️ **React** - Fully supported
- ⚡ **Preact** - Fully supported
- 🔥 **SolidJS** - Fully supported
- 📝 **MDX** - Add `.mdx` to the include option

## 🎯 Three.js & Drei Support

The plugin intelligently filters Three.js and Drei 3D elements by default, avoiding adding unnecessary debug attributes in 3D scenes. This feature can be disabled with `filter3DElements: false`.

## 🔍 Practical Usage Examples

### 1. Quick Element Lookup in Console

```javascript
// Find all elements from a specific component
document.querySelectorAll('[data-vt-id*="Header.jsx"]');

// Find a specific element by line number
document.querySelector('[data-vt-id*=":42:"]');
```

### 2. CSS Debugging

```css
/* Style all buttons from a specific file */
[data-vt-id*="ButtonGroup.jsx"] button {
  border: 2px solid red !important;
}

/* Highlight a specific problematic element */
[data-vt-id="src/components/Form.jsx:156:3"] {
  outline: 3px dashed orange !important;
}
```

### 3. Integration with Testing

```javascript
// In your testing framework
test("header navigation renders correctly", () => {
  // Find elements by their component path
  const navLinks = screen.getAllByTestId(
    (id) => id.startsWith("data-vt-id") && id.includes("Navigation.jsx")
  );
  expect(navLinks.length).toBe(5);
});
```

### 4. Browser DevTools Filtering

1. Open DevTools Elements panel
2. Use the search function (Ctrl+F/Cmd+F)
3. Search for `data-vt-id*="ComponentName"` to quickly locate elements from specific components

## 📝 License

MIT © [kcsx](https://github.com/kcsx)
