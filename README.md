# Kana

`kana` 是一个面向日语初学者的五十音学习项目。

它当前聚焦的是一个清晰的学习闭环：先看总览，再点开单字详情，理解平假名 / 片假名对应、字源与发音，之后再进入练习。

项目现在已经具备：

- 平假名 / 片假名切换
- 准确的五十音空位表达
- 点击字符打开详情弹窗
- 首版发音结构（本地音频优先，TTS 兜底）
- 一套独立维护的项目文档

## 开发

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
```

预览：

```bash
pnpm preview
```

## 文档

项目文档集中放在 `docs/`：

- `docs/README.md`：文档索引与维护约定
- `docs/spec.md`：产品定位、设计哲学、范围边界
- `docs/plan.md`：阶段计划与推进顺序
- `docs/status.md`：当前状态快照
- `docs/tasks.md`：下一步任务清单
- `docs/references.md`：外部参考拆解
