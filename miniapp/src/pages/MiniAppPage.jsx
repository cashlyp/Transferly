import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Clock3,
  Copy,
  FileText,
  Gauge,
  History,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  Receipt,
  Settings,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Smartphone,
  UserRound,
  Vibrate,
  WalletCards,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import MiniAppShell from '../components/MiniAppShell';
import MiniAppPointsWallet from '../components/MiniAppPointsWallet';
import MiniAppReceiptStudio from '../components/MiniAppReceiptStudio';
import MiniAppReceiptVault from '../components/MiniAppReceiptVault';
import {
  ActivitySection,
  AnalyticsSection,
  ClientsSection,
  InvoicesSection,
  NotificationsSection,
  PayoutsSection,
  ProviderCommandCenter,
  RiskSection,
  SecuritySection
} from '../components/MiniAppFinanceSuite';
import { useAppContext } from '../context/AppContext';
import { useTelegramMiniApp } from '../context/TelegramMiniAppContext';

const sectionMeta = {
  home: {
    title: 'Command Center',
    subtitle: 'Telegram-native workspace'
  },
  studio: {
    title: 'Receipt Studio',
    subtitle: 'Create polished receipts'
  },
  invoices: {
    title: 'Invoice Center',
    subtitle: 'Create, send, remind'
  },
  payouts: {
    title: 'Payout Center',
    subtitle: 'Approve and release funds'
  },
  activity: {
    title: 'Activity Feed',
    subtitle: 'Unified payment timeline'
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Revenue and operations'
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Actionable alerts'
  },
  clients: {
    title: 'Clients',
    subtitle: 'Recipient intelligence'
  },
  risk: {
    title: 'Risk Command',
    subtitle: 'Admin safety controls'
  },
  security: {
    title: 'Security',
    subtitle: 'Session and audit posture'
  },
  vault: {
    title: 'Receipt Vault',
    subtitle: 'Search, duplicate, export'
  },
  wallet: {
    title: 'Points Wallet',
    subtitle: 'Funding and spend control'
  },
  ops: {
    title: 'Provider Command',
    subtitle: 'Provider readiness and health'
  },
  support: {
    title: 'Support Desk',
    subtitle: 'Guided Telegram support'
  },
  profile: {
    title: 'Identity',
    subtitle: 'Telegram and account status'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Preferences and safety'
  }
};

const startParamSections = {
  generate: 'studio',
  studio: 'studio',
  invoice: 'invoices',
  invoices: 'invoices',
  payout: 'payouts',
  payouts: 'payouts',
  activity: 'activity',
  feed: 'activity',
  analytics: 'analytics',
  notifications: 'notifications',
  alerts: 'notifications',
  clients: 'clients',
  risk: 'risk',
  security: 'security',
  wallet: 'wallet',
  vault: 'vault',
  history: 'vault',
  support: 'support',
  profile: 'profile',
  settings: 'settings',
  ops: 'ops'
};

const DEFAULT_SCREEN_KEY = 'transferly_miniapp_default_screen';

const defaultScreenOptions = [
  { id: 'home', label: 'Command', to: '/miniapp', icon: Gauge },
  { id: 'studio', label: 'Studio', to: '/miniapp/studio', icon: Zap },
  { id: 'invoices', label: 'Invoices', to: '/miniapp/invoices', icon: FileText },
  { id: 'payouts', label: 'Payouts', to: '/miniapp/payouts', icon: Send },
  { id: 'analytics', label: 'Metrics', to: '/miniapp/analytics', icon: BarChart3 },
  { id: 'vault', label: 'Vault', to: '/miniapp/vault', icon: History },
  { id: 'wallet', label: 'Wallet', to: '/miniapp/wallet', icon: WalletCards },
  { id: 'ops', label: 'Providers', to: '/miniapp/ops', icon: ShieldCheck },
  { id: 'support', label: 'Support', to: '/miniapp/support', icon: LifeBuoy }
];

function readStoredMiniAppSetting(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return window.localStorage.getItem(key) || fallback;
}

function StatCard({ icon: Icon, label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-[var(--tg-section-bg-color)]',
    accent: 'bg-[color-mix(in_srgb,var(--tg-button-color)_14%,var(--tg-section-bg-color))]',
    warn: 'bg-[color-mix(in_srgb,#f59e0b_16%,var(--tg-section-bg-color))]',
    danger: 'bg-[color-mix(in_srgb,var(--tg-destructive-text-color)_12%,var(--tg-section-bg-color))]'
  };

  return (
    <div className={`rounded-[24px] p-4 shadow-sm ${toneClasses[tone] || toneClasses.default}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{value}</p>
    </div>
  );
}

function ActionCard({ icon: Icon, title, body, to, badge, accent = false }) {
  return (
    <Link
      to={to}
      className={`group block rounded-[26px] p-5 shadow-sm transition active:scale-[0.99] ${
        accent
          ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
          : 'bg-[var(--tg-section-bg-color)] text-[var(--tg-text-color)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          accent
            ? 'bg-white/16 text-[var(--tg-button-text-color)]'
            : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-button-color)]'
        }`}>
          <Icon size={22} />
        </div>
        {badge ? (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            accent ? 'bg-white/16 text-white' : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-hint-color)]'
          }`}>
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 text-lg font-black tracking-[-0.03em]">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${accent ? 'text-white/76' : 'text-[var(--tg-subtitle-text-color)]'}`}>
        {body}
      </p>
      <div className="mt-5 flex items-center gap-2 text-sm font-black">
        Open
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function HeroPanel({ profile, telegram, receipts, topUpOrders }) {
  const firstName = telegram.user?.first_name || profile?.name?.split(' ')?.[0] || 'Operator';
  const latestOrder = topUpOrders[0];

  return (
    <section className="overflow-hidden rounded-[30px] bg-[var(--tg-section-bg-color)] shadow-[0_22px_70px_rgba(15,23,42,0.14)]">
      <div className="relative p-5">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--tg-button-color)_28%,transparent)] blur-2xl" />
        <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--tg-accent-text-color)_22%,transparent)] blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tg-secondary-bg-color)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">
            <Sparkles size={14} />
            Premium Mini App
          </div>
          <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-[-0.055em] text-[var(--tg-text-color)] sm:text-5xl">
            Build receipts, manage points, and operate from Telegram.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--tg-subtitle-text-color)]">
            {firstName}, this is the Telegram-native workspace for fast generation, wallet visibility, history, support, and operator flows.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard icon={WalletCards} label="Balance" value={`${Number(profile?.points || 0).toLocaleString()} pts`} tone="accent" />
            <StatCard icon={Receipt} label="Receipts" value={receipts.length.toLocaleString()} />
            <StatCard icon={Clock3} label="Latest order" value={latestOrder?.status || 'None'} tone={latestOrder ? 'warn' : 'default'} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSection({ profile, telegram, receipts, topUpOrders }) {
  return (
    <div className="space-y-4">
      <HeroPanel profile={profile} telegram={telegram} receipts={receipts} topUpOrders={topUpOrders} />

      <div className="grid gap-3 sm:grid-cols-2">
        <ActionCard
          icon={FileText}
          title="Invoice center"
          body="Create invoices, send reminders, monitor states, and inspect timeline evidence."
          to="/miniapp/invoices"
          badge="Revenue"
          accent
        />
        <ActionCard
          icon={Send}
          title="Payout center"
          body="Submit, refresh, and review payout releases from a mobile-first operations desk."
          to="/miniapp/payouts"
          badge="Funds"
        />
        <ActionCard
          icon={BarChart3}
          title="Analytics"
          body="Track inflow, outflow, receipts, wallet funding, and operational velocity."
          to="/miniapp/analytics"
          badge="Live"
        />
        <ActionCard
          icon={Activity}
          title="Activity feed"
          body="Scan invoices, payouts, funding, receipts, and issues in one chronological view."
          to="/miniapp/activity"
          badge="Timeline"
        />
        <ActionCard
          icon={Zap}
          title="Generate receipt"
          body="Launch the polished studio with live preview, service presets, and export actions."
          to="/miniapp/studio"
          badge="Fast"
        />
        <ActionCard
          icon={WalletCards}
          title="Top up points"
          body="Create a funding order, track status, and keep the support handoff visible."
          to="/miniapp/wallet"
          badge="Wallet"
        />
        <ActionCard
          icon={History}
          title="Open vault"
          body="Search history, duplicate receipts, preview, export, and share from one place."
          to="/miniapp/vault"
          badge="History"
        />
        <ActionCard
          icon={Bell}
          title="Notifications"
          body="Review urgent approvals, delayed funding, webhook alerts, and support follow-ups."
          to="/miniapp/notifications"
          badge="Alerts"
        />
        <ActionCard
          icon={UserRound}
          title="Client intelligence"
          body="See recipient value, latest invoices, engagement signals, and next best actions."
          to="/miniapp/clients"
          badge="CRM"
        />
        <ActionCard
          icon={ShieldCheck}
          title="Security posture"
          body="Audit Telegram session state, account linking, export controls, and safety posture."
          to="/miniapp/security"
          badge="Safe"
        />
        <ActionCard
          icon={ShieldCheck}
          title="Provider command"
          body="Admin-only provider readiness, balances, webhook health, issues, invoices, and payouts."
          to="/miniapp/ops"
          badge="Admin"
        />
        <ActionCard
          icon={LockKeyhole}
          title="Risk command"
          body="Admin-only exception queue for blocked payouts, disputes, and sensitive events."
          to="/miniapp/risk"
          badge="Admin"
        />
      </div>
    </div>
  );
}

function buildSupportContext({ source, telegram, profile, user, receipts, topUpOrders, paymentIssues }) {
  const latestOrder = topUpOrders[0];
  const latestReceipt = receipts[0];

  return [
    'Transferly Mini App support context',
    `Screen: ${source || 'support'}`,
    `Telegram: ${telegram.available ? 'detected' : 'browser preview'}`,
    `Telegram user: ${telegram.user?.username ? `@${telegram.user.username}` : telegram.user?.id || 'not available'}`,
    `Transferly user: ${user?.email || user?.id || 'guest'}`,
    `Points: ${Number(profile?.points || 0).toLocaleString()}`,
    `Latest order: ${latestOrder?.order_id || latestOrder?.id || 'none'} ${latestOrder?.status || ''}`.trim(),
    `Latest receipt: ${latestReceipt?.id || latestReceipt?.title || 'none'}`,
    `Open payment issues: ${paymentIssues.length.toLocaleString()}`
  ].join('\n');
}

function SupportSection({ telegram, profile, user, receipts, topUpOrders, paymentIssues }) {
  const location = useLocation();
  const supportContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return buildSupportContext({
      source: params.get('from') || params.get('screen') || 'support',
      telegram,
      profile,
      user,
      receipts,
      topUpOrders,
      paymentIssues
    });
  }, [location.search, paymentIssues, profile, receipts, telegram, topUpOrders, user]);

  const copyContext = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(supportContext);
      telegram.notify('success');
      toast.success('Support context copied');
    } catch (_error) {
      telegram.notify('error');
      toast.error('Unable to copy support context');
    }
  }, [supportContext, telegram]);

  useEffect(() => {
    return telegram.configureMainButton?.({
      text: 'Copy Support Context',
      enabled: true,
      onClick: copyContext
    });
  }, [copyContext, telegram]);

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]">
            <LifeBuoy size={26} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Support desk</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Guided help with context</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--tg-subtitle-text-color)]">
              The premium support flow should attach current screen, user, order, receipt, and provider context before handoff.
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Attached context</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Ready for support handoff</h3>
            <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-[22px] bg-[var(--tg-secondary-bg-color)] p-4 text-xs font-bold leading-6 text-[var(--tg-subtitle-text-color)]">
              {supportContext}
            </pre>
          </div>
          <button
            type="button"
            onClick={copyContext}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)] shadow-sm transition active:scale-95"
            aria-label="Copy support context"
          >
            <Copy size={19} />
          </button>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <ActionCard icon={MessageCircle} title="Funding issue" body="Report point release problems with order context." to="/buy-point" badge="Points" />
        <ActionCard icon={Receipt} title="Receipt issue" body="Open history, choose a receipt, and attach details." to="/transactions" badge="Vault" />
        <ActionCard icon={Bot} title="Bot access" body="Check Telegram identity and access state before support escalation." to="/miniapp/profile" badge={telegram.available ? 'Verified' : 'Preview'} />
        <ActionCard icon={LifeBuoy} title="Help center" body="Use the existing FAQ and help page while Mini App support grows." to="/help" badge="FAQ" />
      </div>
    </div>
  );
}

function ProfileSection({ telegram, profile, user }) {
  const referralCode = profile?.referral_code || 'Not assigned';

  const copyReferral = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      telegram.notify('success');
      toast.success('Referral code copied');
    } catch (_error) {
      toast.error('Unable to copy referral code');
    }
  }, [referralCode, telegram]);

  useEffect(() => {
    return telegram.configureMainButton?.({
      text: 'Copy Referral Code',
      enabled: referralCode !== 'Not assigned',
      onClick: copyReferral
    });
  }, [copyReferral, referralCode, telegram]);

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--tg-button-color)] text-xl font-black text-[var(--tg-button-text-color)]">
            {(telegram.user?.first_name || profile?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Account identity</p>
            <h2 className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">
              {telegram.user?.first_name || profile?.name || user?.email || 'Guest preview'}
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--tg-hint-color)]">
              {telegram.user?.username ? `@${telegram.user.username}` : telegram.available ? 'Telegram user' : 'Browser fallback'}
            </p>
          </div>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard icon={UserRound} label="Transferly user" value={user ? 'Linked' : 'Guest'} tone={user ? 'accent' : 'warn'} />
        <StatCard icon={ShieldCheck} label="Admin" value={profile?.is_admin ? 'Enabled' : 'No'} />
        <StatCard icon={Star} label="Referrals" value={Number(profile?.referral_count || 0).toLocaleString()} />
        <button
          type="button"
          onClick={copyReferral}
          className="rounded-[24px] bg-[var(--tg-section-bg-color)] p-4 text-left shadow-sm transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
            <Copy size={15} />
            Referral code
          </div>
          <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{referralCode}</p>
        </button>
      </div>
    </div>
  );
}

function SettingsSection({ telegram, profile, user }) {
  const navigate = useNavigate();
  const [defaultScreen, setDefaultScreen] = useState(() => {
    const stored = readStoredMiniAppSetting(DEFAULT_SCREEN_KEY, 'studio');
    return defaultScreenOptions.some((option) => option.id === stored) ? stored : 'studio';
  });

  const selectedScreen = defaultScreenOptions.find((option) => option.id === defaultScreen) || defaultScreenOptions[1];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEFAULT_SCREEN_KEY, defaultScreen);
    }
  }, [defaultScreen]);

  const openSelectedScreen = useCallback(() => {
    telegram.impact('medium');
    navigate(selectedScreen.to);
  }, [navigate, selectedScreen.to, telegram]);

  useEffect(() => {
    return telegram.configureMainButton?.({
      text: 'Open Default Screen',
      enabled: true,
      onClick: openSelectedScreen
    });
  }, [openSelectedScreen, telegram]);

  const toggleHaptics = () => {
    const nextValue = !telegram.hapticsEnabled;
    telegram.setHapticsEnabled(nextValue);

    if (nextValue) {
      telegram.impact('light');
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]">
            <Settings size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Mini App settings</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Telegram-native preferences</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--tg-subtitle-text-color)]">
              Tune the native Telegram controls, default workspace route, and account handoff state for this device.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Smartphone} label="Runtime" value={telegram.available ? 'Telegram' : 'Preview'} tone={telegram.available ? 'accent' : 'warn'} />
        <StatCard icon={Vibrate} label="Haptics" value={telegram.hapticsEnabled ? 'Enabled' : 'Muted'} />
        <StatCard icon={UserRound} label="Account" value={user || profile ? 'Linked' : 'Guest'} tone={user || profile ? 'accent' : 'warn'} />
      </div>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">
              <Vibrate size={15} />
              Telegram haptics
            </div>
            <h3 className="mt-2 text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">
              {telegram.hapticsEnabled ? 'Feedback is on' : 'Feedback is muted'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
              Controls tactile feedback for Mini App buttons and successful actions on Telegram clients that support haptics.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={telegram.hapticsEnabled}
            aria-label="Telegram haptics"
            onClick={toggleHaptics}
            className={`flex h-12 w-24 shrink-0 items-center rounded-full p-1 transition active:scale-95 ${
              telegram.hapticsEnabled
                ? 'justify-end bg-[var(--tg-button-color)]'
                : 'justify-start bg-[var(--tg-secondary-bg-color)]'
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tg-button-text-color)] text-[var(--tg-button-color)] shadow-sm">
              <Vibrate size={17} />
            </span>
          </button>
        </div>
      </section>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Default screen</p>
            <h3 className="mt-2 text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">
              Open {selectedScreen.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
              Save the first workspace you want one tap away from the native Main Button.
            </p>
          </div>
          <button
            type="button"
            onClick={openSelectedScreen}
            className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-[var(--tg-button-color)] px-5 py-3 text-sm font-black text-[var(--tg-button-text-color)] shadow-sm transition active:scale-[0.98]"
          >
            Open
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {defaultScreenOptions.map((option) => {
            const Icon = option.icon;
            const active = option.id === defaultScreen;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setDefaultScreen(option.id);
                  telegram.impact('light');
                }}
                className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-[22px] px-3 py-3 text-xs font-black transition active:scale-[0.98] ${
                  active
                    ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
                    : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-hint-color)]'
                }`}
                aria-pressed={active}
              >
                <Icon size={19} />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <ActionCard icon={UserRound} title="Identity" body="Review Telegram user, referral code, admin state, and linked Transferly account." to="/miniapp/profile" badge="Account" />
        <ActionCard icon={LifeBuoy} title="Support context" body="Copy a current support bundle with runtime, account, wallet, and latest receipt details." to="/miniapp/support?from=settings" badge="Help" />
      </div>
    </div>
  );
}

export default function MiniAppPage() {
  const { section = 'home' } = useParams();
  const navigate = useNavigate();
  const telegram = useTelegramMiniApp();
  const {
    user,
    profile,
    receipts,
    topUpOrders,
    paymentIssues
  } = useAppContext();
  const activeSection = sectionMeta[section] ? section : 'home';
  const meta = sectionMeta[activeSection];

  useEffect(() => {
    if (activeSection !== 'home' || !telegram.startParam) {
      return;
    }

    const [rawTarget] = String(telegram.startParam).toLowerCase().split(':');
    const targetSection = startParamSections[rawTarget];
    if (targetSection) {
      navigate(`/miniapp/${targetSection}`, { replace: true });
    }
  }, [activeSection, navigate, telegram.startParam]);

  const mainButton = useMemo(() => {
    switch (activeSection) {
      case 'invoices':
        return { text: 'Create Invoice', action: () => navigate('/miniapp/invoices') };
      case 'payouts':
        return { text: 'Create Payout', action: () => navigate('/miniapp/payouts') };
      case 'activity':
        return { text: 'Open Alerts', action: () => navigate('/miniapp/notifications') };
      case 'analytics':
        return { text: 'Open Activity', action: () => navigate('/miniapp/activity') };
      case 'notifications':
        return { text: 'Copy Support Context', action: () => navigate('/miniapp/support?from=notifications') };
      case 'clients':
        return { text: 'Create Invoice', action: () => navigate('/miniapp/invoices') };
      case 'risk':
        return { text: profile?.is_admin ? 'Open Admin Ops' : 'Request Access', action: () => navigate(profile?.is_admin ? '/admin' : '/miniapp/support?from=risk') };
      case 'security':
        return { text: 'Open Settings', action: () => navigate('/miniapp/settings?from=security') };
      case 'vault':
        return { text: 'Open Full History', action: () => navigate('/transactions') };
      case 'wallet':
        return { text: 'Create Top-Up Order', action: () => navigate('/buy-point') };
      case 'ops':
        return { text: profile?.is_admin ? 'Open Admin Ops' : 'Request Access', action: () => navigate(profile?.is_admin ? '/admin' : '/miniapp/support') };
      default:
        return { text: 'Generate Receipt', action: () => navigate('/miniapp/studio') };
    }
  }, [activeSection, navigate, profile?.is_admin]);

  useEffect(() => {
    if (['studio', 'vault', 'wallet', 'support', 'profile', 'settings'].includes(activeSection)) {
      return undefined;
    }

    const button = telegram.webApp?.MainButton;
    if (!button) {
      return undefined;
    }

    const handleClick = () => {
      telegram.impact('medium');
      mainButton.action();
    };

    button.setText?.(mainButton.text);
    button.enable?.();
    button.show?.();
    button.onClick?.(handleClick);

    return () => {
      button.offClick?.(handleClick);
      button.hide?.();
    };
  }, [activeSection, mainButton, telegram]);

  return (
    <MiniAppShell title={meta.title} subtitle={meta.subtitle}>
      {activeSection === 'home' ? (
        <HomeSection profile={profile} telegram={telegram} receipts={receipts} topUpOrders={topUpOrders} />
      ) : null}
      {activeSection === 'studio' ? <MiniAppReceiptStudio /> : null}
      {activeSection === 'invoices' ? <InvoicesSection /> : null}
      {activeSection === 'payouts' ? <PayoutsSection /> : null}
      {activeSection === 'activity' ? <ActivitySection /> : null}
      {activeSection === 'analytics' ? <AnalyticsSection /> : null}
      {activeSection === 'notifications' ? <NotificationsSection /> : null}
      {activeSection === 'clients' ? <ClientsSection /> : null}
      {activeSection === 'risk' ? <RiskSection /> : null}
      {activeSection === 'security' ? <SecuritySection /> : null}
      {activeSection === 'vault' ? <MiniAppReceiptVault /> : null}
      {activeSection === 'wallet' ? <MiniAppPointsWallet /> : null}
      {activeSection === 'ops' ? <ProviderCommandCenter /> : null}
      {activeSection === 'support' ? (
        <SupportSection
          telegram={telegram}
          profile={profile}
          user={user}
          receipts={receipts}
          topUpOrders={topUpOrders}
          paymentIssues={paymentIssues}
        />
      ) : null}
      {activeSection === 'profile' ? <ProfileSection telegram={telegram} profile={profile} user={user} /> : null}
      {activeSection === 'settings' ? <SettingsSection telegram={telegram} profile={profile} user={user} /> : null}
    </MiniAppShell>
  );
}
