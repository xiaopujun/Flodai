# Light Chaser Pro - UI 设计规范文档

本文档基于 "Dark Blue Dashboard" 设计风格制定，旨在统一项目的视觉体验与交互规范。后续所有组件开发与页面设计均需严格遵循本规范。

## 1. 设计理念 (Design Philosophy)

*   **沉浸式深色主题 (Immersive Dark Theme)**: 使用深蓝/蓝紫作为主色调，营造科技感与现代感，降低长时间使用的视觉疲劳。
*   **高对比度 (High Contrast)**: 关键数据与操作按钮使用高饱和度的霓虹色（粉、蓝、青），在深色背景下形成鲜明对比。
*   **层级分明 (Clear Hierarchy)**: 通过背景亮度的细微差异（背景色 vs 卡片色）与投影区分内容层级。
*   **卡片式布局 (Card-based Layout)**: 内容被封装在独立的卡片容器中，边界清晰，圆角柔和。

---

## 2. 颜色系统 (Color System)

### 2.1 背景色 (Backgrounds)
*   **应用背景 (App Background)**: `#1E1E2F` (深蓝黑色，用于页面底层)
*   **卡片背景 (Card Background)**: `#27293D` (稍亮的蓝灰色，用于内容容器)
*   **侧边栏/导航栏 (Navigation)**: `#1E1E2F` 或透明度变体

### 2.2 品牌色 / 强调色 (Brand & Accent Colors)
*   **主色调 (Primary - Pink/Red)**: `#FD5D93` (用于主要操作按钮如 "Create"、关键高亮)
    *   *渐变应用*: `linear-gradient(to bottom left, #fd5d93, #ec250d)`
*   **信息色 (Info - Blue)**: `#1D8CF8` (用于辅助图表、链接、选中状态)
    *   *渐变应用*: `linear-gradient(to bottom left, #1d8cf8, #3358f4)`
*   **成功色 (Success - Teal/Green)**: `#00F2C3` (用于增长趋势、完成状态)
    *   *渐变应用*: `linear-gradient(to bottom left, #00f2c3, #0098f0)`
*   **警告/其他 (Warning/Purple)**: `#E14ECA` (用于特定图表线条或次要高亮)

### 2.3 文本颜色 (Typography Colors)
*   **主要文本 (Heading/Body)**: `#FFFFFF` (纯白，用于标题、数值、正文)
*   **次要文本 (Muted/Label)**: `#9A9A9A` (灰白，用于副标题、图表轴标、辅助说明)
*   **占位符/禁用 (Disabled)**: `rgba(255, 255, 255, 0.3)`

---

## 3. 排版 (Typography)

*   **字体家族 (Font Family)**: `"Poppins", "Roboto", "Helvetica Neue", Arial, sans-serif`
*   **字重 (Font Weight)**:
    *   Light: 300 (大标题)
    *   Regular: 400 (正文)
    *   Medium: 500 (导航、小标题)
    *   Bold: 700 (关键数值)

### 3.1 文字层级规范
*   **H1 / 页面标题**: 24px - 32px, White
*   **H2 / 卡片标题**: 16px - 18px, Muted (`#9A9A9A`)，通常位于卡片左上角
*   **H3 / 关键数值**: 24px - 36px, White, Bold (e.g., "9,000")
*   **Body / 正文**: 14px, White/Muted
*   **Small / 辅助文字**: 12px, Muted

---

## 4. 布局与间距 (Layout & Spacing)

### 4.1 栅格系统 (Grid)
*   采用 12 列栅格系统。
*   **Gutter (槽宽)**: 20px - 30px。

### 4.2 尺寸与圆角 (Dimensions & Radius)
*   **卡片圆角 (Card Radius)**: `4px` 或 `6px` (保持微圆角，避免过度圆润)
*   **按钮圆角 (Button Radius)**: `4px` (实心按钮) / `30px` (胶囊型，视具体场景)
*   **内边距 (Padding)**:
    *   卡片内边距: `20px` (标准)
    *   卡片头部与内容间距: `15px`

---

## 5. 组件样式规范 (Component Styles)

### 5.1 卡片 (Cards)
*   **背景**: `#27293D`
*   **阴影**: `0 1px 20px 0px rgba(0, 0, 0, 0.1)` (极其柔和的阴影，主要靠颜色区分层级)
*   **边框**: 无边框 (None)

### 5.2 按钮 (Buttons)
*   **主要按钮 (Primary - "Create")**:
    *   背景: `#FD5D93` (或渐变)
    *   文字: White
    *   圆角: `4px`
    *   阴影: `0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)`
    *   交互: Hover 时亮度提升或阴影加深。
*   **次要/幽灵按钮 (Secondary/Outline - "Add Task")**:
    *   背景: Transparent
    *   边框: `1px solid #FD5D93` (或其他强调色)
    *   文字: White 或 对应强调色

### 5.3 图表 (Charts)
*   **线条**: 平滑曲线 (Spline)。
*   **描边宽度**: `3px`。
*   **特效**: 
    *   线条发光效果 (Glow/Shadow): `drop-shadow(0px 5px 5px rgba(..., 0.4))`
    *   节点: 实心圆点，白色描边。

### 5.4 导航栏 (Navbar)
*   **布局**: 顶部水平布局。
*   **状态**: 
    *   激活项: 亮白色文字 + 底部或侧边强调色圆点 (e.g., 蓝色小圆点)。
    *   未激活项: 灰色文字 (`#9A9A9A`)。

---

## 6. 代码实现参考 (CSS Variables)

```css
:root {
  /* Colors */
  --lc-color-bg-app: #1e1e2f;
  --lc-color-bg-card: #27293d;
  
  --lc-color-primary: #fd5d93;
  --lc-color-info: #1d8cf8;
  --lc-color-success: #00f2c3;
  --lc-color-warning: #ff8d72;
  --lc-color-danger: #fd5d93;

  /* Text */
  --lc-color-text-primary: #ffffff;
  --lc-color-text-secondary: #9a9a9a;
  --lc-color-text-disabled: rgba(255, 255, 255, 0.3);

  /* Spacing & Radius */
  --lc-radius-base: 4px;
  --lc-padding-card: 20px;
  
  /* Typography */
  --lc-font-family: "Poppins", sans-serif;
}
```
