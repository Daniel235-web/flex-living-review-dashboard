/**
 * Premium Icon System — Lucide React
 * Replace all emojis with professional SVG icons
 */

import {
  Coins,
  DollarSign,
  Building2,
  Trophy,
  Home,
  Lock,
  Star,
  Vote,
  Settings,
  BarChart3,
  Zap,
  FileText,
  Shield,
  TrendingUp,
  CheckCircle2,
  Users,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export const IconMap = {
  // Dashboard & Navigation
  dashboard: Coins,
  properties: Building2,
  escrow: Lock,
  reviews: Star,
  reputation: Trophy,
  governance: Vote,

  // Tokens & Finance
  flex: Coins,
  usdc: DollarSign,
  gas: Zap,

  // Status & Actions
  active: CheckCircle2,
  pending: Clock,
  verified: Shield,
  error: AlertCircle,

  // Analytics
  chart: BarChart3,
  trending: TrendingUp,
  stats: BarChart3,

  // Properties
  property: Home,
  rent: DollarSign,
  deposit: Lock,

  // Community
  review: Star,
  vote: Vote,
  users: Users,

  // Settings
  settings: Settings,
  info: FileText,

  // UI
  arrow: ArrowRight,
} as const;

export type IconName = keyof typeof IconMap;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  const IconComponent = IconMap[name];
  return <IconComponent size={size} className={className} />;
}

// Tier emoji replacements (visual badges)
export const TIER_ICONS = {
  0: "🥉", // Bronze
  1: "🥈", // Silver
  2: "🥇", // Gold
  3: "💎", // Platinum
  4: "👑", // Diamond
} as const;
