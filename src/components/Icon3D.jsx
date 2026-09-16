import React, { useState } from 'react';
import { 
  GraduationCap, 
  Globe, 
  Map, 
  Compass, 
  Lock, 
  ShieldCheck, 
  BarChart3, 
  Sparkles, 
  Database, 
  Cloud, 
  Monitor, 
  CheckCircle2, 
  Bell, 
  ClipboardList, 
  FileText, 
  Volume2, 
  Users, 
  User, 
  Settings, 
  Rocket, 
  Save 
} from 'lucide-react';

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/';

const ICONS_3D_MAP = {
  graduation: {
    path: 'Graduation%20cap/3D/graduation_cap_3d.png',
    fallback: GraduationCap,
    label: 'Topi Wisuda 3D',
  },
  gis: {
    path: 'Globe%20with%20meridians/3D/globe_with_meridians_3d.png',
    fallback: Globe,
    label: 'Globe SIG 3D',
  },
  globe: {
    path: 'Globe%20with%20meridians/3D/globe_with_meridians_3d.png',
    fallback: Globe,
    label: 'Globe 3D',
  },
  map: {
    path: 'World%20map/3D/world_map_3d.png',
    fallback: Map,
    label: 'Peta Dunia 3D',
  },
  compass: {
    path: 'Compass/3D/compass_3d.png',
    fallback: Compass,
    label: 'Kompas SIG 3D',
  },
  lock: {
    path: 'Locked%20with%20key/3D/locked_with_key_3d.png',
    fallback: Lock,
    label: 'Kunci Pengaman 3D',
  },
  security: {
    path: 'Locked%20with%20key/3D/locked_with_key_3d.png',
    fallback: Lock,
    label: 'Keamanan 3D',
  },
  shield: {
    path: 'Shield/3D/shield_3d.png',
    fallback: ShieldCheck,
    label: 'Perisai Lab 3D',
  },
  chart: {
    path: 'Bar%20chart/3D/bar_chart_3d.png',
    fallback: BarChart3,
    label: 'Grafik Nilai 3D',
  },
  stats: {
    path: 'Bar%20chart/3D/bar_chart_3d.png',
    fallback: BarChart3,
    label: 'Statistik 3D',
  },
  sparkles: {
    path: 'Sparkles/3D/sparkles_3d.png',
    fallback: Sparkles,
    label: 'Kilauan 3D',
  },
  database: {
    path: 'Card%20file%20box/3D/card_file_box_3d.png',
    fallback: Database,
    label: 'Database Master 3D',
  },
  cloud: {
    path: 'Cloud/3D/cloud_3d.png',
    fallback: Cloud,
    label: 'Supabase Cloud 3D',
  },
  computer: {
    path: 'Desktop%20computer/3D/desktop_computer_3d.png',
    fallback: Monitor,
    label: 'Komputer SIG 3D',
  },
  check: {
    path: 'Check%20mark%20button/3D/check_mark_button_3d.png',
    fallback: CheckCircle2,
    label: 'Tanda Centang 3D',
  },
  bell: {
    path: 'Bell/3D/bell_3d.png',
    fallback: Bell,
    label: 'Lonceng 3D',
  },
  clipboard: {
    path: 'Clipboard/3D/clipboard_3d.png',
    fallback: ClipboardList,
    label: 'Papan Catatan 3D',
  },
  memo: {
    path: 'Memo/3D/memo_3d.png',
    fallback: FileText,
    label: 'Lembar Nilai 3D',
  },
  speaker: {
    path: 'Speaker%20high%20volume/3D/speaker_high_volume_3d.png',
    fallback: Volume2,
    label: 'Audio Speaker 3D',
  },
  users: {
    path: 'Busts%20in%20silhouette/3D/busts_in_silhouette_3d.png',
    fallback: Users,
    label: 'Praktikan 3D',
  },
  user: {
    path: 'Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png',
    fallback: User,
    label: 'Mahasiswa 3D',
  },
  gear: {
    path: 'Gear/3D/gear_3d.png',
    fallback: Settings,
    label: 'Pengaturan 3D',
  },
  rocket: {
    path: 'Rocket/3D/rocket_3d.png',
    fallback: Rocket,
    label: 'Roket Cepat 3D',
  },
  save: {
    path: 'Floppy%20disk/3D/floppy_disk_3d.png',
    fallback: Save,
    label: 'Simpan Data 3D',
  }
};

/**
 * Komponen Ikon 3D Online Beresolusi Tinggi (Microsoft Fluent 3D Emoji)
 * Mendukung hover floating 3D, drop shadow, dan graceful fallback ke Lucide ikon.
 */
export default function Icon3D({ 
  name = 'globe', 
  size = 28, 
  className = '', 
  hoverAnimate = true,
  alt = ''
}) {
  const [hasError, setHasError] = useState(false);
  const iconConfig = ICONS_3D_MAP[name.toLowerCase()] || ICONS_3D_MAP.globe;
  const FallbackIcon = iconConfig.fallback;

  if (hasError) {
    return (
      <FallbackIcon 
        style={{ width: size, height: size }} 
        className={`inline-block ${className}`} 
        aria-hidden="true" 
      />
    );
  }

  const iconUrl = `${CDN_BASE}${iconConfig.path}`;

  return (
    <span 
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${
        hoverAnimate ? 'transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 active:scale-95' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={iconUrl}
        alt={alt || iconConfig.label}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
      />
    </span>
  );
}
