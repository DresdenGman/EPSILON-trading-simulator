# 第二层级：压力测试模块功能说明

## 📋 模块概述

压力测试模块旨在生成**极端市场行情**（黑天鹅事件），用于测试交易策略在极端情况下的表现。这对于评估策略的**鲁棒性**和**风险承受能力**至关重要。

---

## 🎯 核心功能

### 1. **跳跃扩散模型 (Jump Diffusion Model)** - 阶段1

#### 功能描述
在正常的随机游走基础上，随机引入大幅价格跳跃，模拟市场中的突发性极端事件。

#### 实现原理
- **正常波动**：保持现有的 ±4.5% 日波动率
- **跳跃事件**：以低概率（如 2-5%）触发大幅价格变动
- **跳跃幅度**：可配置（如 -20% 暴跌、+15% 暴涨）

#### 应用场景
- **闪崩模拟**：模拟 2020 年 3 月的市场崩盘
- **突发利空**：公司丑闻、监管打击等
- **市场恐慌**：流动性危机、系统性风险

#### 技术实现
```python
# 伪代码示例
if random.random() < jump_probability:  # 例如 2%
    jump_size = random.choice([-0.20, -0.15, -0.10])  # 暴跌
    change_percent += jump_size
```

#### 配置参数
- `jump_probability`: 跳跃事件发生概率（默认 2%）
- `jump_sizes`: 跳跃幅度列表（如 [-0.20, -0.15, -0.10]）
- `jump_direction`: 允许的方向（下跌/上涨/双向）

---

### 2. **极值分布 (Extreme Value Distribution)** - 阶段2

#### 功能描述
使用统计学中的极值理论（EVT）生成尾部风险，更准确地模拟罕见但可能发生的极端事件。

#### 实现原理
- **GEV 分布**（广义极值分布）：用于模拟极端收益
- **Pareto 分布**：用于模拟尾部风险
- **分位数方法**：基于历史数据估计极端分位数

#### 应用场景
- **VaR 测试**：测试策略在 99% VaR 下的表现
- **压力情景**：模拟 2008 年金融危机级别的市场冲击
- **尾部风险评估**：评估策略在极端情况下的最大损失

#### 技术实现
```python
# 伪代码示例
from scipy.stats import genextreme, pareto

# 使用 GEV 分布生成极端负收益
extreme_return = genextreme.rvs(c=-0.3, loc=-0.05, scale=0.10)
# 或使用 Pareto 分布
tail_risk = pareto.rvs(b=2.5, scale=0.05)
```

#### 配置参数
- `extreme_probability`: 极值事件概率（如 1%）
- `distribution_type`: 分布类型（GEV/Pareto/Custom）
- `tail_threshold`: 尾部阈值（如 -10%）

---

### 3. **Quantile Regression 生成器** - 阶段3（高级）

#### 功能描述
基于 Grid Risk 论文的方法，使用分位数回归（Quantile Regression）和 XGBoost 来预测极端分位数，生成更智能的尾部风险场景。

#### 实现原理
- **分位数回归**：预测不同分位数（如 1%, 5%, 95%, 99%）的收益
- **特征工程**：使用技术指标、市场情绪等特征
- **XGBoost 模型**：训练模型预测极端分位数
- **动态调整**：根据市场状态动态调整风险水平

#### 应用场景
- **智能压力测试**：基于当前市场状态生成合理的极端情景
- **条件 VaR**：考虑市场条件的条件风险价值
- **策略优化**：识别策略在哪些市场条件下容易失效

#### 技术实现
```python
# 伪代码示例
from sklearn.ensemble import GradientBoostingRegressor

# 训练分位数回归模型
model_1pct = GradientBoostingRegressor(loss='quantile', alpha=0.01)
model_1pct.fit(features, returns)

# 预测极端分位数
extreme_return = model_1pct.predict(current_features)
```

#### 配置参数
- `quantile_levels`: 分位数水平（如 [0.01, 0.05, 0.95, 0.99]）
- `feature_set`: 使用的特征（技术指标、市场情绪等）
- `model_type`: 模型类型（XGBoost/Neural Network/Linear）

---

## 🔧 实现阶段

### **阶段1：跳跃扩散（推荐先实现）**
- **工作量**：1-2 天
- **难度**：⭐ 简单
- **功能**：在现有数据生成中加入跳跃事件
- **影响范围**：`_generate_mock_history()` 和 `_generate_mock_stock_data()`

### **阶段2：极值分布** ✅ 已完成
- **工作量**：2-3 天
- **难度**：⭐⭐ 中等
- **功能**：使用统计分布生成尾部风险
- **依赖**：scipy（可选，已实现手动版本）
- **实现**：
  - GEV 分布（广义极值分布）
  - Pareto 分布（帕累托分布）
  - Simple 模式（简单阈值，无需 scipy）
  - 已集成到数据生成流程
  - GUI 配置界面已添加

### **阶段3：Quantile Regression** ✅ 已完成
- **工作量**：1-2 周
- **难度**：⭐⭐⭐ 复杂
- **功能**：智能预测极端分位数
- **依赖**：scikit-learn（可选，有回退方法）
- **实现**：
  - QuantileRegressionModel 类
  - 特征工程（技术指标计算）
  - 分位数回归预测
  - 简单统计方法回退（无需 scikit-learn）
  - 已集成到数据生成流程
  - GUI 配置界面已添加

---

## 💡 使用场景示例

### 场景1：测试策略在闪崩中的表现
```python
# 配置：2% 概率触发 -20% 暴跌
stress_config = {
    "jump_probability": 0.02,
    "jump_sizes": [-0.20, -0.15],
    "jump_direction": "down"
}

# 运行回测
results = backtest_engine.run_with_stress_test(stress_config)
# 查看策略在极端情况下的最大回撤
print(f"最大回撤: {results['max_drawdown']}")
```

### 场景2：评估策略的尾部风险
```python
# 使用极值分布生成 1% 尾部风险
stress_config = {
    "extreme_probability": 0.01,
    "distribution_type": "GEV",
    "tail_threshold": -0.10
}

# 运行压力测试
stress_results = run_stress_test(strategy, stress_config)
# 评估策略在极端情况下的表现
print(f"极端情况下的 Sharpe Ratio: {stress_results['sharpe_ratio']}")
```

---

## 🎨 GUI 集成方案

### 选项1：在策略对战系统中集成
- 在策略对战窗口添加"压力测试"选项
- 可以选择不同的压力测试模式
- 显示策略在极端情况下的排名变化

### 选项2：独立的压力测试窗口
- 创建新的压力测试窗口（类似频谱分析）
- 可以配置压力测试参数
- 可视化极端事件的发生和影响

### 选项3：在数据生成设置中集成
- 在设置中添加"压力测试模式"开关
- 可以全局启用/禁用压力测试
- 配置压力测试参数

---

## 📊 预期效果

### 对策略评估的影响
1. **更真实的回测**：包含极端事件，避免过度乐观
2. **风险识别**：发现策略在极端情况下的脆弱点
3. **策略优化**：基于压力测试结果改进策略

### 对用户体验的提升
1. **更专业的工具**：提供机构级别的压力测试功能
2. **差异化优势**：大多数交易模拟器没有此功能
3. **教育价值**：帮助用户理解尾部风险和风险管理

---

## 🚀 开始实现

建议从**阶段1（跳跃扩散）**开始，因为：
- ✅ 实现简单，快速见效
- ✅ 不需要额外依赖
- ✅ 可以立即展示效果
- ✅ 为后续阶段打下基础

准备好开始实现了吗？我们可以从阶段1开始！
