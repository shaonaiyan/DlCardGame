# 游戏数据配置 Excel 规范

游戏支持通过 Excel 文件动态配置全局参数和卡牌数值。

## 文件格式
*   格式：`.xlsx` 或 `.xls`
*   Sheet 数量：2个 (`GlobalSettings` 和 `Units`)

---

## Sheet 1: GlobalSettings (全局设置)

此表用于配置游戏规则、资源回复和队长属性。

| 列名 (Key) | 说明 | 类型 | 示例值 |
| :--- | :--- | :--- | :--- |
| **Key** | 配置项名称 (必须严格匹配) | String | `INITIAL_ENERGY` |
| **Value** | 配置数值 | Number | `15` |
| **Description** | 备注 (仅用于说明，不读取) | String | `初始能量` |

### 支持的 Key 列表

**游戏规则:**
*   `INITIAL_ENERGY`: 初始能量值
*   `MAX_ENERGY`: 最大能量上限
*   `ENERGY_REGEN_PER_SEC`: 每秒能量回复速度
*   `GAME_DURATION_SECONDS`: 游戏总时长(秒)
*   `MAX_RAGE`: 满怒气值 (通常为1000)
*   `ATTACK_COOLDOWN_MS`: 普通攻击间隔(毫秒)
*   `BASE_GAME_SPEED`: 基础游戏倍速 (1.0)

**战斗公式:**
*   `TAUNT_DURATION_MS`: 嘲讽持续时间(毫秒)
*   `SHIELD_ABSORB_RATIO`: 坦克护盾系数 (0.3 = 30% HP)
*   `CRIT_CHANCE`: 暴击概率 (0-1)
*   `CRIT_MULTIPLIER`: 暴击伤害倍率 (1.5)
*   `BLOCK_CHANCE`: 格挡概率 (0-1)
*   `BLOCK_MULTIPLIER`: 格挡减伤倍率 (0.7)

**玩家队长 (Player):**
*   `PLAYER_CAPTAIN_HP`: 玩家生命值
*   `PLAYER_CAPTAIN_ATK`: 玩家攻击力
*   `PLAYER_CAPTAIN_DEF`: 玩家防御力
*   `PLAYER_CAPTAIN_RAGE_REGEN_PER_SEC`: 玩家怒气自动回复速度

**敌方 Boss (Enemy):**
*   `ENEMY_CAPTAIN_HP`: Boss生命值
*   `ENEMY_CAPTAIN_ATK`: Boss攻击力
*   `ENEMY_CAPTAIN_DEF`: Boss防御力
*   `ENEMY_CAPTAIN_RAGE_REGEN_PER_SEC`: Boss怒气自动回复速度

---

## Sheet 2: Units (卡牌/单位配置)

此表用于配置所有可抽到的单位卡牌属性。

| 列名 | 说明 | 类型 | 示例 |
| :--- | :--- | :--- | :--- |
| **id** | 单位唯一ID (不要修改) | String | `unit_tank` |
| **name** | 单位显示名称 | String | `重装骑士` |
| **type** | 单位职业类型 | Enum | `TANK`, `ARCHER`, `HEALER`, `MAGE`, `ASSASSIN`, `BERSERKER`, `PALADIN` |
| **cost** | 召唤费用 | Number | `5` |
| **hp** | 生命值 | Number | `2200` |
| **atk** | 攻击力 | Number | `120` |
| **def** | 防御力 | Number | `120` |
| **description** | 卡牌描述文本 | String | `坚不可摧的前排壁垒` |
| **skillDescription** | 技能描述文本 | String | `嘲讽敌军` |
| **color** | 卡牌背景颜色 (Tailwind类) | String | `bg-gradient-to-br from-slate-700 to-slate-900` |
| **icon** | 图标名称 (Lucide icon) | String | `Shield` |

### 操作流程
1. 点击游戏界面右上角的 **下载图标** 获取当前配置的 Excel 模板。
2. 在 Excel 中修改数值。
3. 点击 **上传图标** 选择修改后的 Excel 文件。
4. 游戏会弹出提示“配置已更新”，随后请点击“再来一局”或刷新页面应用新数值。
