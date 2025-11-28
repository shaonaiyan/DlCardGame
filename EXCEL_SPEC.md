# 游戏数据配置 Excel 规范

游戏配置需包含以下5个 Sheet（工作表）。请确保Sheet名称和列名完全匹配。

---

## Sheet 1: Global (全局配置)

| 列名 (Col) | 说明 | 示例值 |
| :--- | :--- | :--- |
| **Key** | 配置项键名 (ID) | `INITIAL_ENERGY` |
| **Value** | 数值 | `15` |
| **Description** | 备注 | `初始能量` |

**常用 Key:**
* `INITIAL_ENERGY`: 初始能量
* `MAX_ENERGY`: 最大能量
* `ENERGY_REGEN_PER_SEC`: 能量回复速度/秒
* `GAME_DURATION_SECONDS`: 游戏时间
* `MAX_RAGE`: 满怒气值 (1000)
* `ATTACK_COOLDOWN_MS`: 普攻间隔(毫秒)

---

## Sheet 2: Units (单位配置)

| 列名 (Col) | 说明 | 示例 |
| :--- | :--- | :--- |
| **ID** | 单位数字ID | `101` |
| **Name** | 名称 | `重装骑士` |
| **Type** | 类型 (TANK, ARCHER等) | `TANK` |
| **Cost** | 费用 | `5` |
| **HP** | 生命值 | `2200` |
| **ATK** | 攻击力 | `120` |
| **DEF** | 防御力 | `120` |
| **SkillID** | 关联技能ID (对应Skills表) | `101` |
| **Color** | 颜色样式 (Tailwind) | `bg-red-500` |
| **Icon** | 图标 (Shield, Sword等) | `Shield` |

---

## Sheet 3: Captains (队长/主角配置)

| 列名 (Col) | 说明 | 示例 |
| :--- | :--- | :--- |
| **ID** | 0: 玩家, 1: 敌人 | `0` |
| **Name** | 队长名称 | `人族领袖` |
| **HP** | 生命值 | `16000` |
| **ATK** | 攻击力 | `450` |
| **DEF** | 防御力 | `100` |
| **RageRegen** | 怒气自动回复/秒 | `20` |
| **SkillID** | 技能ID | `901` |

---

## Sheet 4: Effects (效果配置)

| 列名 (Col) | 说明 | 示例值 |
| :--- | :--- | :--- |
| **Key** | 键名 | `CRIT_CHANCE` |
| **Value** | 数值 | `0.2` |

**常用 Key:**
* `CRIT_CHANCE`: 暴击率 (0-1)
* `CRIT_MULTIPLIER`: 暴击倍率
* `BLOCK_CHANCE`: 格挡率
* `BLOCK_MULTIPLIER`: 格挡受伤倍率 (0.7 = 受伤70%)
* `SHIELD_ABSORB_RATIO`: 坦克/技能护盾系数

---

## Sheet 5: Skills (技能配置)

| 列名 (Col) | 说明 | 选项/示例 |
| :--- | :--- | :--- |
| **ID** | 技能ID | `101` |
| **Name** | 技能名称 | `嘲讽` |
| **Description** | 描述 | `嘲讽敌人` |
| **TargetType** | 目标类型 | `SELF`, `ALL_ENEMIES`, `ALL_ALLIES`, `SINGLE_ENEMY`, `LOWEST_HP_ALLY`, `RANDOM_3_ENEMIES`, `FRONT_3_STRIKES` |
| **EffectType** | 效果类型 | `DAMAGE`, `HEAL`, `SHIELD`, `TAUNT_AND_SHIELD` |
| **Multiplier** | 效果倍率/系数 | `2.0` (2倍攻击伤害) |
| **ExtraValue** | 额外固定数值 | `0` |

