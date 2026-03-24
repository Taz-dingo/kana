# Kana Memory System Design

## 目标

为 `kana` 设计一个适合初学者、可持续迭代、受 Anki / FSRS 启发但不过度复杂的记忆系统。

这个方案的目标不是一开始就做成通用 SRS 平台，而是先为五十音学习建立一套足够清晰、足够有效、可以逐步升级的系统骨架。

## 设计原则

### 1. 先做可执行的最小系统，再追求调度精度

第一版的重点是：

- 建立学习状态
- 建立复习入口
- 建立回忆题型
- 建立简单调度规则

而不是一开始就实现完整 `FSRS` 参数优化。

### 2. 记忆系统服务学习路径，而不是取代学习路径

用户仍然需要：

- 先看总览
- 再理解平 / 片对应
- 再听音
- 再进入回忆训练

记忆系统应该接在学习流之后，而不是从第一秒开始强迫刷卡。

### 3. 优先做“提取”而不是“浏览”

任何会进入调度系统的学习内容，都应该允许用户主动回忆，而不是只是再次阅读说明。

### 4. 每日负担必须可控

系统要能回答：

- 今天有多少新内容
- 今天有多少复习内容
- 现在最值得先做哪一部分

### 5. 本地优先，但从第一天开始可迁移

第一版先使用本地存储，不是因为它是最终形态，而是因为它能最低成本验证：

- 状态字段是否合理
- 调度规则是否顺手
- 用户每天的复习负担是否可控

但架构上必须把三层拆开：

- `memory model`：状态类型与领域字段
- `memory engine`：调度与状态更新纯函数
- `memory repository`：读写状态的存储适配层

这样第一版可以用 `localStorage`，后续接数据库时只需要替换 repository 实现，而不必重写调度逻辑或 UI。

## 系统边界

## 第一阶段纳入记忆系统的内容

- 基础五十音 46 个字符
- 平假名 / 片假名对应
- 罗马音识别
- 部分易混淆字符对比

## 第一阶段暂不纳入

- 浊音 / 拗音 / 长音 / 促音
- 句子级学习
- 复杂语法知识点
- 开放输入评分
- 多端同步与账户系统

## 用户流程

### 路径 A：首次学习

1. 用户进入总览
2. 系统推荐一个小组（例如元音组）
3. 用户浏览与听音
4. 用户进入该组练习
5. 系统记录表现并建立初始记忆状态

### 路径 B：日常复习

1. 用户进入首页或学习面板
2. 系统展示“今日待复习”数量
3. 用户先做复习，再决定是否学习新内容
4. 复习完成后更新每个字符的稳定度与下一次时间

### 路径 C：弱项强化

1. 用户在某些字符上反复出错
2. 系统把它们放入“高优先复习”或“易混淆练习”
3. 用户在短周期内再次遇到它们

## 内容粒度

每个 `kana` 字符是一个最小学习项。

每个学习项至少要支持：

- 主显示字符（当前主视图平 / 片）
- 对应字符（另一套字形）
- romaji
- 可选音频
- 字源 / 备注
- 记忆状态字段

## 数据模型建议

建议新增一个独立的 `memory state` 层，而不是把状态直接塞进静态数据表。

### `KanaMemoryState`

```ts
interface KanaMemoryState {
  kanaId: string;
  introducedAt: string | null;
  dueAt: string | null;
  lastReviewedAt: string | null;
  lastResult: "again" | "hard" | "good" | "easy" | null;
  lapseCount: number;
  reviewCount: number;
  stability: number;
  difficulty: number;
  status: "new" | "learning" | "review" | "mastered";
}
```

### 存储抽象建议

```ts
interface MemoryRepository {
  loadStates(): Promise<Record<string, KanaMemoryState>>;
  saveStates(states: Record<string, KanaMemoryState>): Promise<void>;
}
```

第一版：

- 使用 `localStorageMemoryRepository`

后续可扩展：

- `apiMemoryRepository`
- `supabaseMemoryRepository`
- `sqliteMemoryRepository`

### 字段解释

- `introducedAt`
  - 第一次进入正式学习流程的时间
- `dueAt`
  - 下次应该复习的时间
- `lastReviewedAt`
  - 最近一次复习时间
- `lastResult`
  - 最近一次反馈按钮结果
- `lapseCount`
  - 失败次数
- `reviewCount`
  - 总复习次数
- `stability`
  - 当前可维持记忆的稳定度，第一版可以用简单数字表达
- `difficulty`
  - 当前主观难度，第一版可以用范围 `1-10`
- `status`
  - 当前大状态，用于 UI 展示与筛选

## 调度策略

## MVP：FSRS-lite

第一版建议不要直接实现复杂参数优化，而是先做一个清晰的简化版。

### 初始状态

- 新字符第一次学完后进入 `learning`
- 初始 `stability = 0.5`
- 初始 `difficulty = 5`
- 第一次 `dueAt` 安排在较短时间后，例如当天稍后或次日

### 评分按钮

建议沿用接近 Anki 的四档，但文案可以更自然：

- `again`：没记住
- `hard`：想起来了，但很吃力
- `good`：正常想起来了
- `easy`：很轻松

### 间隔更新逻辑

第一版可采用简化规则：

- `again`
  - `lapseCount + 1`
  - `stability` 明显下降
  - `dueAt` 提前到很近
- `hard`
  - `stability` 小幅上升
  - `difficulty` 上升或保持
  - 下次间隔较短
- `good`
  - `stability` 正常上升
  - `difficulty` 轻微下降或保持
  - 下次间隔按稳定度扩展
- `easy`
  - `stability` 明显上升
  - `difficulty` 下降
  - 下次间隔拉长

### 示例规则

仅作为第一版占位，不是最终公式：

```ts
again => nextIn = 10 minutes
hard  => nextIn = max(1 day, stability * 1.2 days)
good  => nextIn = max(2 days, stability * 2 days)
easy  => nextIn = max(4 days, stability * 3 days)
```

然后再根据结果调整 `stability` 与 `difficulty`。

## 未来阶段：接近 FSRS 的建模

当项目进入更成熟阶段后，可以逐步升级为：

- 用 `retrievability` 估计当前回忆概率
- 用更多历史记录决定 `difficulty`
- 引入用户级参数而不是只看卡片级参数
- 逐步减少硬编码间隔规则

也就是说：

- MVP 先做“规则驱动”
- V2 再做“模型驱动”

## 题型设计

## 第一阶段必须支持的题型

### 1. `kana -> romaji`

作用：建立最基础识别能力

### 2. `romaji -> kana`

作用：验证是否真正记住字形

### 3. `audio -> kana`

作用：把声音和字形绑定起来

### 4. 易混淆对比

优先候选：

- `シ / ツ`
- `ソ / ン`
- `ぬ / め / ね`
- `さ / ち / き`（按实际错误数据再收敛）

## 题型与记忆系统的关系

- 不是所有题型都必须进入同一调度层
- 但至少要有一种“标准回忆题型”作为主调度依据

建议第一版以 `romaji -> kana` 作为主评分题型，其他题型作为辅助训练。

## 页面结构建议

### 1. Dashboard / 学习面板

显示：

- 今日待复习数
- 今日新内容数
- 当前学习阶段
- 最近薄弱项

### 2. Learn

显示：

- 当前小组新内容
- 浏览、听音、字源、平片对照
- 学完后进入本组练习

### 3. Review

显示：

- 到期项目
- 单题练习
- Again / Hard / Good / Easy 反馈

### 4. Weak Spots

显示：

- 最近反复出错的字符
- 易混淆专项训练

### 5. Progress

显示：

- 总体掌握度
- 每行掌握度
- 新学 / 学习中 / 复习中 / 已掌握统计

## UI 层原则

### 1. 不要让调度感压过学习感

用户不应该一进页面就看到一堆算法状态。

更好的方式是把技术状态翻译为自然语言：

- 今日待复习 12 个
- 这组还差 3 个稳定
- 这 5 个字符最容易混淆

### 2. 评分按钮要真实可懂

不要要求初学者理解 `Again / Hard / Good / Easy` 的算法含义。

可以考虑中文文案：

- 没记住
- 有点难
- 记住了
- 很轻松

### 3. 先轻量记录，再决定是否暴露细节

第一版 UI 不需要把 `stability`、`difficulty` 等内部变量直接显示给用户。

## 成功指标

### 产品层

- 用户能明确区分“学新内容”和“做复习”
- 用户知道今天应该做什么
- 用户可以看到自己是否在变稳

### 学习层

- 相比纯浏览模式，回忆正确率有提升
- 易混淆字符错误率逐步下降
- 用户能够在几天后仍保持较高识别率

### 系统层

- 每日复习负担可控
- 新内容引入不会迅速形成复习债
- 状态计算逻辑足够简单、可解释、可调试
- 后续更换存储后端时，不需要重写调度逻辑

## 推荐落地顺序

### Phase A：结构先行

- 建立 `KanaMemoryState`
- 建立本地存储 repository
- 建立 `due today` 计算逻辑
- 建立可迁移的存储接口
- 增加学习面板入口

### Phase B：最小练习闭环

- 做 `romaji -> kana` 主练习
- 做四档评分
- 让复习后能更新状态与下次时间

### Phase C：题型扩展

- 增加 `kana -> romaji`
- 增加 `audio -> kana`
- 增加易混淆训练

### Phase D：升级调度

- 调整稳定度更新规则
- 更细地建模困难项
- 逐步向 `FSRS-lite` 的个性化方向靠近

### Phase E：后端迁移

- 保持 memory model 与 scheduler 不变
- 新增远端 repository 实现
- 逐步加入登录、同步与冲突处理

## 当前建议

对 `kana` 来说，下一步最有价值的不是继续堆更多静态内容，而是：

1. 把五十音从“可浏览内容”升级为“可调度学习项”
2. 建立最小可用复习系统
3. 先做简单、可解释、稳定的调度规则
4. 用本地 repository 快速验证状态层
5. 后续再考虑更高阶的个性化参数优化与数据库迁移
