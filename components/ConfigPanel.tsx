import React, { useRef } from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { GAME_CONFIG, CARD_TEMPLATES } from '../constants';

interface ConfigPanelProps {
  onUpdateConfig: (newConfig: any, newTemplates: any) => void;
  currentConfig: any;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ onUpdateConfig, currentConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Global Settings Sheet
    // Flatten nested objects for simple Key-Value pair editing
    const globalData = [];
    
    // Add top-level keys
    Object.keys(GAME_CONFIG).forEach(key => {
       if (typeof GAME_CONFIG[key] !== 'object') {
           globalData.push({ Key: key, Value: GAME_CONFIG[key], Description: '' });
       }
    });
    
    // Add Player Captain keys
    Object.keys(GAME_CONFIG.PLAYER_CAPTAIN).forEach(key => {
        globalData.push({ Key: `PLAYER_CAPTAIN_${key}`, Value: GAME_CONFIG.PLAYER_CAPTAIN[key], Description: 'Player Captain Stats' });
    });

    // Add Enemy Captain keys
    Object.keys(GAME_CONFIG.ENEMY_CAPTAIN).forEach(key => {
        globalData.push({ Key: `ENEMY_CAPTAIN_${key}`, Value: GAME_CONFIG.ENEMY_CAPTAIN[key], Description: 'Enemy Captain Stats' });
    });

    const wsGlobal = XLSX.utils.json_to_sheet(globalData);
    XLSX.utils.book_append_sheet(wb, wsGlobal, "GlobalSettings");

    // 2. Units Sheet
    const unitsData = Object.values(CARD_TEMPLATES).map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        cost: t.cost,
        hp: t.hp,
        atk: t.atk,
        def: t.def,
        description: t.description,
        skillDescription: t.skillDescription,
        color: t.color,
        icon: t.icon
    }));
    const wsUnits = XLSX.utils.json_to_sheet(unitsData);
    XLSX.utils.book_append_sheet(wb, wsUnits, "Units");

    // Download
    XLSX.writeFile(wb, "GameData_Config.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        try {
            // 1. Parse Global Settings
            const wsGlobal = wb.Sheets["GlobalSettings"];
            if (wsGlobal) {
                const globalRaw = XLSX.utils.sheet_to_json(wsGlobal) as any[];
                const newConfig = JSON.parse(JSON.stringify(GAME_CONFIG)); // Deep clone default

                globalRaw.forEach(row => {
                    const k = row.Key;
                    const v = row.Value;

                    if (k.startsWith('PLAYER_CAPTAIN_')) {
                        const field = k.replace('PLAYER_CAPTAIN_', '');
                        if (newConfig.PLAYER_CAPTAIN.hasOwnProperty(field)) newConfig.PLAYER_CAPTAIN[field] = v;
                    } else if (k.startsWith('ENEMY_CAPTAIN_')) {
                        const field = k.replace('ENEMY_CAPTAIN_', '');
                        if (newConfig.ENEMY_CAPTAIN.hasOwnProperty(field)) newConfig.ENEMY_CAPTAIN[field] = v;
                    } else {
                        if (newConfig.hasOwnProperty(k)) newConfig[k] = v;
                    }
                });

                // 2. Parse Units
                const wsUnits = wb.Sheets["Units"];
                const newTemplates: any = {};
                if (wsUnits) {
                    const unitsRaw = XLSX.utils.sheet_to_json(wsUnits) as any[];
                    unitsRaw.forEach(u => {
                        newTemplates[u.id] = { ...u };
                    });
                }
                
                // Callback to update App state
                onUpdateConfig(newConfig, newTemplates);
                alert("配置已更新！请点击'再来一局'或刷新战斗以应用新数值。");
            }
        } catch (err) {
            console.error(err);
            alert("解析Excel失败，请确保格式正确。");
        }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
       <button 
         onClick={handleDownloadTemplate}
         className="w-10 h-10 flex items-center justify-center bg-green-800/80 text-white rounded-full hover:bg-green-700 border border-green-600 shadow-lg backdrop-blur"
         title="下载配置Excel模板"
       >
         <Download size={18} />
       </button>
       
       <button 
         onClick={() => fileInputRef.current?.click()}
         className="w-10 h-10 flex items-center justify-center bg-blue-800/80 text-white rounded-full hover:bg-blue-700 border border-blue-600 shadow-lg backdrop-blur"
         title="上传配置Excel"
       >
         <Upload size={18} />
       </button>
       <input 
         type="file" 
         ref={fileInputRef} 
         className="hidden" 
         accept=".xlsx, .xls"
         onChange={handleFileUpload}
       />
    </div>
  );
};
