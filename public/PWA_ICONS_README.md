# PWA 图标说明

## 需要的图标文件

为了 PWA 完整功能，请添加以下图标文件到 `/public` 目录：

### 必需的图标
- `icon-192x192.png` - 192x192 像素
- `icon-256x256.png` - 256x256 像素
- `icon-384x384.png` - 384x384 像素
- `icon-512x512.png` - 512x512 像素

### 可选的截图（用于安装横幅）
- `screenshot-desktop.png` - 1280x720 像素（桌面端）
- `screenshot-mobile.png` - 750x1334 像素（移动端）

## 设计建议

1. **图标设计**
   - 使用简洁、清晰的设计
   - 确保在小尺寸下也清晰可辨
   - 建议使用武士数独的 logo 或数字网格图案
   - 背景色建议使用紫色渐变或深色

2. **图标样式**
   - 圆角矩形（推荐 20% 圆角）
   - maskable safe area: 80% 的中心区域
   - 可以使用在线工具如 [Maskable.app](https://maskable.app/) 检查

3. **快速生成工具**
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [Favicon Generator](https://realfavicongenerator.net/)
   - [Maskable.app Editor](https://maskable.app/editor)

## 临时解决方案

在没有图标的情况下，可以使用以下占位符：

```bash
# 使用 ImageMagick 创建简单的占位符图标
convert -size 192x192 xc:#667eea -gravity center -fill white -pointsize 80 -annotate +0+0 "数独" icon-192x192.png
convert -size 256x256 xc:#667eea -gravity center -fill white -pointsize 100 -annotate +0+0 "数独" icon-256x256.png
convert -size 384x384 xc:#667eea -gravity center -fill white -pointsize 150 -annotate +0+0 "数独" icon-384x384.png
convert -size 512x512 xc:#667eea -gravity center -fill white -pointsize 200 -annotate +0+0 "数独" icon-512x512.png
```

或者简单地复制 favicon.ico 并重命名为各个尺寸的 PNG 文件。
