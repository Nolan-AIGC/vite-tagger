import { describe, it, expect } from "vitest";
import { viteTagger } from "./index";

describe("viteTagger", () => {
  it("should extract text content correctly", async () => {
    // 明确启用插件，不依赖环境变量
    const plugin = viteTagger({
      debug: true,
      enabled: true,
    });

    console.log("NODE_ENV:", process.env.NODE_ENV);

    // 模拟代码，包含各种类型的JSX元素
    const testCode = `
import React from 'react';

export function TestComponent() {
  return (
    <div>
      <button>Click me</button>
      <input placeholder="Enter name" className="input-field" />
      <p>Hello world</p>
      <span title="tooltip">Hover me</span>
      <div>
        <span>Nested text</span>
      </div>
      <button className="btn" id="submit-btn">Submit Form</button>
      <div>
        Text with {variable} interpolation
      </div>
      <p>
        Multi line
        text content
      </p>
    </div>
  );
}
    `;

    const mockId = "/test/component.tsx";

    console.log("Plugin config:", plugin);
    console.log("Testing with code length:", testCode.length);

    // 调用transform方法
    const transformHandler = plugin.transform as any;
    const result = await transformHandler.call({}, testCode, mockId);

    console.log("Transform result:", result);

    if (result && typeof result === "object" && "code" in result) {
      const transformedCode = result.code;
      console.log("Transformed code length:", transformedCode.length);
      console.log(
        "First 500 chars of transformed code:",
        transformedCode.substring(0, 500)
      );

      // 检查是否有data-component-content属性
      const contentMatches = transformedCode.match(
        /data-component-content="([^"]+)"/g
      );
      console.log("Content matches:", contentMatches);

      if (contentMatches) {
        contentMatches.forEach((match: string, index: number) => {
          const encodedContent = match.match(
            /data-component-content="([^"]+)"/
          )?.[1];
          if (encodedContent) {
            const decodedContent = decodeURIComponent(encodedContent);
            console.log(`Content ${index + 1}:`, decodedContent);

            try {
              const parsedContent = JSON.parse(decodedContent);
              console.log(`Parsed content ${index + 1}:`, parsedContent);
            } catch (e) {
              console.error(`Failed to parse content ${index + 1}:`, e);
            }
          }
        });
      }

      // 验证不应该都是空对象
      expect(contentMatches).toBeDefined();
      expect(contentMatches!.length).toBeGreaterThan(0);

      // 检查是否有非空的content
      const hasNonEmptyContent = contentMatches!.some((match: string) => {
        const encodedContent = match.match(
          /data-component-content="([^"]+)"/
        )?.[1];
        if (encodedContent) {
          const decodedContent = decodeURIComponent(encodedContent);
          return decodedContent !== "{}" && decodedContent.length > 2;
        }
        return false;
      });

      expect(hasNonEmptyContent).toBe(true);

      // 检查空content的元素不应该有data-component-content属性
      const inputElement = transformedCode.match(/<input[^>]+>/);
      expect(inputElement).toBeDefined();
      expect(inputElement![0].includes("data-component-content")).toBe(false);
    } else {
      console.log(
        "No transformation result - plugin may not have processed the file"
      );
      expect(result).not.toBeNull();
    }
  });

  it("should handle simple button with text", async () => {
    const plugin = viteTagger({
      debug: true,
      enabled: true,
    });

    const simpleCode = `
export function SimpleButton() {
  return <button>Click me</button>;
}
    `;

    console.log("Simple test code:", simpleCode);

    const transformHandler = plugin.transform as any;
    const result = await transformHandler.call(
      {},
      simpleCode,
      "/test/simple.tsx"
    );

    console.log("Simple button transform result:", result);

    if (result && typeof result === "object" && "code" in result) {
      console.log("Simple button result code:", result.code);

      const contentMatch = result.code.match(
        /data-component-content="([^"]+)"/
      );
      if (contentMatch) {
        const decodedContent = decodeURIComponent(contentMatch[1]);
        console.log("Simple button content:", decodedContent);

        const parsedContent = JSON.parse(decodedContent);
        expect(parsedContent).toHaveProperty("text", "Click me");
      } else {
        console.log("No content match found in simple button test");
      }
    } else {
      console.log("Simple button test - no transformation result");
      expect(result).not.toBeNull();
    }
  });

  // 添加新的测试用例：验证空content不添加属性
  it("should not add data-component-content for empty content objects", async () => {
    const plugin = viteTagger({
      debug: true,
      enabled: true,
    });

    const emptyContentCode = `
export function EmptyContent() {
  return (
    <div>
      <img src="/logo.png" alt="Logo" />
      <br />
      <hr className="divider" />
      <input type="text" placeholder="Type here" />
    </div>
  );
}
    `;

    const transformHandler = plugin.transform as any;
    const result = await transformHandler.call(
      {},
      emptyContentCode,
      "/test/empty.tsx"
    );

    if (result && typeof result === "object" && "code" in result) {
      const transformedCode = result.code;
      console.log("Empty content test code:", transformedCode);

      // 检查所有元素
      const elements = [
        transformedCode.match(/<img[^>]+>/),
        transformedCode.match(/<br[^>]+>/),
        transformedCode.match(/<hr[^>]+>/),
        transformedCode.match(/<input[^>]+>/),
      ];

      // 检查每个元素都没有data-component-content属性
      elements.forEach((element, index) => {
        if (element) {
          console.log(`Element ${index + 1}:`, element[0]);
          expect(element[0].includes("data-component-content")).toBe(false);
        }
      });

      // 但应该有其他的data-vt属性
      elements.forEach((element, index) => {
        if (element) {
          expect(element[0].includes("data-vt-id")).toBe(true);
          expect(element[0].includes("data-vt-name")).toBe(true);
        }
      });
    }
  });
});
