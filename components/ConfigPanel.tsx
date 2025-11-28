import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DEFAULT_CONFIG, DEFAULT_TEMPLATES, DEFAULT_SKILLS } from '../constants';
import { GameConfig, CardTemplate, SkillTemplate } from '../types';

interface ConfigPanelProps {
  onUpdateConfig: (newConfig: GameConfig, newTemplates: Record<string, CardTemplate>, newSkills: Record<number, SkillTemplate>) => void;
  currentConfig: GameConfig;
  currentTemplates: Record<string, CardTemplate>;
  currentSkills: Record<number, SkillTemplate>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
    onUpdateConfig, 
    currentConfig, 
    currentTemplates,
    currentSkills
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Global Sheet
    const globalRows = Object.entries(currentConfig.global).map(([k, v]) => ({ Key: k, Value: v, Description: '' }));
    const wsGlobal = XLSX.utils.json_to_sheet(globalRows);
    XLSX.utils.book_append_sheet(wb, wsGlobal, "Global");

    // 2. Captains Sheet
    const captainRows = Object.entries(currentConfig.captains).map(([id, stats]: [string, any]) => ({
        ID: parseInt(id),
        Name: stats.name,
        HP: stats.hp,
        ATK: stats.atk,
        DEF: stats.def,
        RageRegen: stats.rageRegen,
        SkillID: stats.skillId,
        Note: id === '0' ? 'Player' : 'Enemy'
    }));
    const wsCaptains = XLSX.utils.json_to_sheet(captainRows);
    XLSX.utils.book_append_sheet(wb, wsCaptains, "Captains");

    // 3. Effects Sheet
    const effectRows = Object.entries(currentConfig.effects).map(([k, v]) => ({ Key: k, Value: v, Description: '' }));
    const wsEffects = XLSX.utils.json_to_sheet(effectRows);
    XLSX.utils.book_append_sheet(wb, wsEffects, "Effects");

    // 4. Skills Sheet
    const skillRows = Object.values(currentSkills).map((s: SkillTemplate) => ({
        ID: s.id,
        Name: s.name,
        Description: s.description,
        TargetType: s.targetType,
        EffectType: s.effectType,
        Multiplier: s.multiplier,
        ExtraValue: s.extraValue || 0
    }));
    const wsSkills = XLSX.utils.json_to_sheet(skillRows);
    XLSX.utils.book_append_sheet(wb, wsSkills, "Skills");

    // 5. Units Sheet
    const unitRows = Object.values(currentTemplates).map((t: CardTemplate) => ({
        ID: parseInt(t.id),
        Name: t.name,
        Type: t.type,
        Cost: t.cost,
        HP: t.hp,
        ATK: t.atk,
        DEF: t.def,
        SkillID: t.skillId,
        Color: t.color,
        Icon: t.icon
    }));
    const wsUnits = XLSX.utils.json_to_sheet(unitRows);
    XLSX.utils.book_append_sheet(wb, wsUnits, "Units");

    XLSX.writeFile(wb, "GameConfig.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        try {
            // Reconstruct Data
            const newConfig: GameConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            const newTemplates: Record<string, CardTemplate> = {};
            const newSkills: Record<number, SkillTemplate> = {};

            // 1. Global
            const wsGlobal = wb.Sheets["Global"];
            if (wsGlobal) {
                const rows = XLSX.utils.sheet_to_json(wsGlobal) as any[];
                rows.forEach(r => newConfig.global[r.Key] = r.Value);
            }

            // 2. Captains
            const wsCaptains = wb.Sheets["Captains"];
            if (wsCaptains) {
                const rows = XLSX.utils.sheet_to_json(wsCaptains) as any[];
                rows.forEach(r => {
                    newConfig.captains[r.ID] = {
                        name: r.Name,
                        hp: r.HP,
                        atk: r.ATK,
                        def: r.DEF,
                        rageRegen: r.RageRegen,
                        skillId: r.SkillID
                    };
                });
            }

            // 3. Effects
            const wsEffects = wb.Sheets["Effects"];
            if (wsEffects) {
                const rows = XLSX.utils.sheet_to_json(wsEffects) as any[];
                rows.forEach(r => newConfig.effects[r.Key] = r.Value);
            }

            // 4. Skills
            const wsSkills = wb.Sheets["Skills"];
            if (wsSkills) {
                const rows = XLSX.utils.sheet_to_json(wsSkills) as any[];
                rows.forEach(r => {
                    newSkills[r.ID] = {
                        id: r.ID,
                        name: r.Name,
                        description: r.Description,
                        targetType: r.TargetType,
                        effectType: r.EffectType,
                        multiplier: r.Multiplier,
                        extraValue: r.ExtraValue
                    };
                });
            }

            // 5. Units
            const wsUnits = wb.Sheets["Units"];
            if (wsUnits) {
                const rows = XLSX.utils.sheet_to_json(wsUnits) as any[];
                rows.forEach(r => {
                    const idStr = r.ID.toString();
                    newTemplates[idStr] = {
                        id: idStr,
                        name: r.Name,
                        type: r.Type,
                        cost: r.Cost,
                        hp: r.HP,
                        atk: r.ATK,
                        def: r.DEF,
                        skillId: r.SkillID,
                        color: r.Color,
                        icon: r.Icon
                    };
                });
            }
            
            onUpdateConfig(newConfig, newTemplates, newSkills);
            alert("配置已更新！");
        } catch (err) {
            console.error(err);
            alert("解析Excel失败，请检查格式。");
        }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
       <button onClick={handleDownloadTemplate} className="w-10 h-10 flex items-center justify-center bg-green-800/80 text-white rounded-full hover:bg-green-700 border border-green-600 shadow-lg backdrop-blur" title="下载配置">
         <Download size={18} />
       </button>
       <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center bg-blue-800/80 text-white rounded-full hover:bg-blue-700 border border-blue-600 shadow-lg backdrop-blur" title="上传配置">
         <Upload size={18} />
       </button>
       <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
    </div>
  );
};