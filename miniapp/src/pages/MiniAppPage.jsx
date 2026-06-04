import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  Gauge,
  History,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Smartphone,
  UserRound,
  Vibrate,
  WalletCards,
  X,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import MiniAppShell from '../components/MiniAppShell';
import MiniAppPointsWallet from '../components/MiniAppPointsWallet';
import MiniAppReceiptStudio from '../components/MiniAppReceiptStudio';
import MiniAppReceiptVault from '../components/MiniAppReceiptVault';
import ServiceLogo from '../components/ServiceLogo';
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
import {
  dashboardPreviewSlugs,
  getRecommendedPointPacks,
  getRelatedServices,
  getServiceBySlug,
  getServiceEstimatedCost,
  getServicePreview
} from '../lib/servicesCatalog';

const sectionMeta = {
  home: {
    title: 'Command Center',
    subtitle: 'Telegram-native workspace'
  },
  services: {
    title: 'Services',
    subtitle: 'Premium service catalog'
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
    title: 'Your transactions',
    subtitle: 'Search, duplicate, export'
  },
  orders: {
    title: 'Orders',
    subtitle: 'Point release history'
  },
  wallet: {
    title: 'Buy Points',
    subtitle: 'Funding methods'
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
    title: 'Referral',
    subtitle: 'Invite and profile'
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
  catalog: 'services',
  marketplace: 'services',
  notifications: 'notifications',
  alerts: 'notifications',
  services: 'services',
  clients: 'clients',
  risk: 'risk',
  security: 'security',
  wallet: 'wallet',
  'buy-point': 'wallet',
  'buy-points': 'wallet',
  vault: 'vault',
  history: 'vault',
  orders: 'orders',
  order: 'orders',
  'flash-mails': 'studio',
  flashmail: 'studio',
  support: 'support',
  profile: 'profile',
  settings: 'settings',
  ops: 'ops'
};

const DEFAULT_SCREEN_KEY = 'transferly_miniapp_default_screen';

const defaultScreenOptions = [
  { id: 'home', label: 'Command', to: '/miniapp', icon: Gauge },
  { id: 'services', label: 'Services', to: '/miniapp/services', icon: Sparkles },
  { id: 'studio', label: 'Studio', to: '/miniapp/studio', icon: Zap },
  { id: 'invoices', label: 'Invoices', to: '/miniapp/invoices', icon: FileText },
  { id: 'payouts', label: 'Payouts', to: '/miniapp/payouts', icon: Send },
  { id: 'analytics', label: 'Metrics', to: '/miniapp/analytics', icon: BarChart3 },
  { id: 'vault', label: 'Vault', to: '/miniapp/vault', icon: History },
  { id: 'orders', label: 'Orders', to: '/miniapp/orders', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', to: '/miniapp/wallet', icon: WalletCards },
  { id: 'ops', label: 'Providers', to: '/miniapp/ops', icon: ShieldCheck },
  { id: 'support', label: 'Support', to: '/miniapp/support', icon: LifeBuoy }
];

const providerHighlights = ['paypal', 'stripe', 'paystack', 'flutterwave', 'crypto', 'wise']
  .map((slug) => getServiceBySlug(slug))
  .filter(Boolean);

const miniAppServiceHighlights = dashboardPreviewSlugs
  .map((slug) => getServiceBySlug(slug))
  .filter(Boolean)
  .slice(0, 10);

const miniAppServiceCategories = [
  { title: 'Premium Articles', slugs: ['articles'] },
  { title: 'Data Generator', slugs: ['faker-data'] },
  { title: 'Bank Slips', slugs: ['opay', 'kuda', 'palmpay'] },
  { title: 'Flash Emails', slugs: ['binance', 'bybit', 'coinbase', 'paypal', 'crypto-com', 'wise', 'cash-app', 'zelle', 'venmo', 'trust-wallet', 'gcash'] },
  { title: 'Crypto Receipts', slugs: ['crypto-receipts'] },
  { title: 'Support Pages', slugs: ['support-sites'] },
  { title: 'Security Center', slugs: ['pass-clone'] },
  { title: 'Wallet Tracker', slugs: ['wallet-tracker'] },
  { title: 'QR Code Generator', slugs: ['qr-code'] },
  { title: 'Link Shortener', slugs: ['link-shortener'] },
  { title: 'Payment Providers', slugs: ['stripe', 'paystack', 'flutterwave', 'crypto'] },
  { title: 'Scripts', slugs: ['investinnova'], action: 'View Purchases', featured: true }
];

const miniAppMailServiceSlugs = new Set([
  'binance',
  'bybit',
  'coinbase',
  'paypal',
  'crypto-com',
  'wise',
  'cash-app',
  'zelle',
  'venmo',
  'trust-wallet',
  'gcash'
]);

const paypalSandboxQuickAccessItems = [
  {
    label: 'Business Tools',
    to: '/miniapp/ops?provider=paypal',
    icon: Layers3
  },
  {
    label: 'Invoicing',
    to: '/miniapp/invoices?provider=paypal',
    icon: Receipt
  },
  {
    label: 'Request money',
    to: '/miniapp/studio?type=email&service=paypal&mode=deposit-mail',
    icon: CreditCard
  },
  {
    label: 'Send money',
    to: '/miniapp/payouts?provider=paypal',
    icon: Send
  },
  {
    label: 'PayPal.Me',
    to: '/miniapp/clients?provider=paypal',
    icon: UserRound
  },
  {
    label: 'PayPal Checkout',
    to: '/miniapp/ops?provider=paypal',
    icon: ShieldCheck
  },
  {
    label: 'PayPal Working Capital',
    to: '/miniapp/wallet?service=paypal',
    icon: WalletCards
  },
  {
    label: 'Payment Links & Buttons',
    to: '/miniapp/studio?type=email&service=paypal&mode=custom-mail',
    icon: Copy
  },
  {
    label: 'Business Debit Card',
    to: '/miniapp/wallet?service=paypal',
    icon: CreditCard
  },
  {
    label: 'Store Sync',
    to: '/miniapp/vault?service=paypal',
    icon: History
  }
];

const paypalSandboxMailTasks = [
  {
    label: 'Custom Mail',
    body: 'Build PayPal flash mail with custom recipient, amount, note, and delivery context.',
    to: '/miniapp/studio?type=email&service=paypal&mode=custom-mail',
    icon: FileText,
    badge: 'Flash'
  },
  {
    label: 'Deposit Mail',
    body: 'Prepare a sandbox deposit notification path with PayPal-specific payment and funding fields.',
    to: '/miniapp/studio?type=email&service=paypal&mode=deposit-mail',
    icon: CreditCard,
    badge: 'Deposit'
  },
  {
    label: 'Mail History',
    body: 'Search, duplicate, and export PayPal mail records from the Transferly vault.',
    to: '/miniapp/vault?service=paypal',
    icon: History,
    badge: 'Vault'
  },
  {
    label: 'Open PayPal provider workspace',
    body: 'Review PayPal provider health, webhook events, invoices, payouts, and recovery actions.',
    to: '/miniapp/ops?provider=paypal',
    icon: ShieldCheck,
    badge: 'Ops'
  }
];

const paypalSandboxPerformanceCards = [
  { label: 'Total sales volume', to: '/miniapp/analytics?provider=paypal&metric=sales-volume' },
  { label: 'Average order value', to: '/miniapp/analytics?provider=paypal&metric=orders' },
  { label: 'Total customers', to: '/miniapp/analytics?provider=paypal&metric=customers' },
  { label: 'Total sales count', to: '/miniapp/analytics?provider=paypal&metric=sales-count' }
];

const paypalSandboxActivityRows = [
  { date: '5/14/26, 4:00 PM', type: 'Payment to', name: 'Customer account', amount: '$1,000.00 USD' },
  { date: '5/4/26, 7:23 AM', type: 'Payment to', name: 'Recipient account', amount: '$550.00 USD' },
  { date: '5/4/26, 7:01 AM', type: 'Withdraw from', name: 'Bank Account', amount: '$500.00 USD' },
  { date: '5/4/26, 7:00 AM', type: 'Transfer to', name: 'Bank Account', amount: '$500.00 USD' }
];

const paypalSandboxDeveloperTasks = [
  { label: 'API credentials', to: '/miniapp/ops?provider=paypal', detail: 'Sandbox client status and setup checks' },
  { label: 'Webhooks', to: '/miniapp/ops?provider=paypal', detail: 'Delivery health, replay, and dead-letter recovery' },
  { label: 'Invoices', to: '/miniapp/invoices?provider=paypal', detail: 'Create, remind, and reconcile PayPal invoices' },
  { label: 'Payouts', to: '/miniapp/payouts?provider=paypal', detail: 'Review and release sandbox payout requests' }
];

const paypalSandboxMenuItems = [
  { label: 'Home', to: '/miniapp/services/paypal', icon: Gauge },
  { label: 'Activity', to: '/miniapp/activity?provider=paypal', icon: Activity, hasPanel: true },
  { label: 'Sales', to: '/miniapp/analytics?provider=paypal&view=sales', icon: BarChart3, hasPanel: true },
  { label: 'Finance', to: '/miniapp/wallet?service=paypal', icon: WalletCards, hasPanel: true },
  { label: 'Operations', to: '/miniapp/ops?provider=paypal', icon: ShieldCheck, hasPanel: true },
  { label: 'Pay & Get Paid', to: '/miniapp/studio?type=email&service=paypal&mode=custom-mail', icon: Send, hasPanel: true },
  { label: 'Business Tools', to: '/miniapp/ops?provider=paypal', icon: Sparkles },
  { label: 'Developer', to: '/miniapp/ops?provider=paypal', icon: ShieldCheck },
  { label: 'Profile', to: '/miniapp/profile', icon: UserRound },
  { label: 'Settings', to: '/miniapp/settings', icon: Settings },
  { label: 'Message Center (0)', to: '/miniapp/notifications', icon: Bell },
  { label: 'Help', to: '/miniapp/support', icon: LifeBuoy },
  { label: 'Log out', to: '/miniapp', icon: ArrowLeft }
];

const paypalSandboxCreateItems = [
  { label: 'P2P Request', to: '/miniapp/studio?type=email&service=paypal&mode=custom-mail', icon: UserRound },
  { label: 'Invoice', to: '/miniapp/invoices?provider=paypal', icon: Receipt },
  { label: 'Payment Link or Button', to: '/miniapp/studio?type=email&service=paypal&mode=custom-mail', icon: Copy },
  { label: 'QR Code', to: '/miniapp/studio?type=email&service=paypal&mode=custom-mail&format=qr', icon: Smartphone },
  { label: 'P2P Payment', to: '/miniapp/payouts?provider=paypal', icon: Send },
  { label: 'Transfer to Bank', to: '/miniapp/wallet?service=paypal', icon: CreditCard }
];

const paypalSandboxFooterLinks = [
  'Help',
  'Contact',
  'Sitemap',
  'Fees',
  'Security',
  'About',
  'Developers',
  'Partners'
];

const paypalSandboxLanguageLinks = ['English'];

const launchSteps = [
  {
    icon: Bot,
    title: 'Open the bot',
    body: 'Start in Telegram with /start or /miniapp so identity, access, and launch context stay native.'
  },
  {
    icon: Smartphone,
    title: 'Launch the miniapp',
    body: 'Jump directly into Studio, Vault, Wallet, Providers, or Support without web login screens.'
  },
  {
    icon: Layers3,
    title: 'Operate faster',
    body: 'Use receipt tools, points, provider status, activity, and support context from one mobile workspace.'
  }
];

const marketplaceLanes = [
  {
    title: 'Verified Wallets',
    body: 'Opay, Kuda, and Palmpay wallet-record flows with guided detail capture and point-aware generation.',
    to: '/miniapp/studio',
    icon: WalletCards,
    badge: 'Records'
  },
  {
    title: 'Verified Notifications',
    body: 'Provider-styled notification receipts for PayPal, Binance, Bybit, Coinbase, Cash App, Zelle, Venmo, Trust Wallet, and GCash.',
    to: '/miniapp/studio',
    icon: Bell,
    badge: 'Receipts'
  },
  {
    title: 'Receipt Vault',
    body: 'Search, duplicate, preview, export, and hand off generated receipts with support-ready context.',
    to: '/miniapp/vault',
    icon: History,
    badge: 'Archive'
  },
  {
    title: 'Support Desk',
    body: 'Launch guided help with current screen, Telegram identity, order, receipt, and provider context attached.',
    to: '/miniapp/support',
    icon: LifeBuoy,
    badge: 'Handoff'
  },
  {
    title: 'Security Center',
    body: 'Review session posture, account linking, export controls, audit posture, and sensitive workflow checks.',
    to: '/miniapp/security',
    icon: LockKeyhole,
    badge: 'Safe'
  },
  {
    title: 'Provider Command',
    body: 'Monitor readiness, balances, webhook health, issue triage, invoices, and payouts for supported rails.',
    to: '/miniapp/ops',
    icon: ShieldCheck,
    badge: 'Ops'
  },
  {
    title: 'Payment QR',
    body: 'Prepare mobile-first payment QR and studio launch flows for fast customer collection workflows.',
    to: '/miniapp/studio',
    icon: CreditCard,
    badge: 'Collect'
  },
  {
    title: 'Payment Links',
    body: 'Track payment-link activity and shorten customer-facing flows from the unified activity timeline.',
    to: '/miniapp/activity',
    icon: Copy,
    badge: 'Links'
  },
  {
    title: 'Template Marketplace',
    body: 'Surface premium workflow templates and reusable operator playbooks for repeatable service delivery.',
    to: '/miniapp/services',
    icon: Star,
    badge: 'Premium'
  },
  {
    title: 'Sandbox Test Data',
    body: 'Generate clearly marked sandbox data for demos, QA, support rehearsals, and safe operator training.',
    to: '/miniapp/services',
    icon: CheckCircle2,
    badge: 'Sandbox'
  }
];

const supportFaqs = [
  {
    question: 'How do I open Transferly without login/register?',
    answer: 'Use the Telegram bot launch buttons. The miniapp reads Telegram context and routes you into the right workspace.'
  },
  {
    question: 'Where do I top up or review points?',
    answer: 'Open Wallet from the miniapp. Support context includes latest order and point balance for faster follow-up.'
  },
  {
    question: 'Where are generated receipts stored?',
    answer: 'Open Vault for searchable history, duplication, preview, export, and support handoff details.'
  },
  {
    question: 'How do provider issues get escalated?',
    answer: 'Open Providers or Support. The support bundle includes runtime, account, order, receipt, and open issue counts.'
  }
];

const orderFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'pending-release', label: 'Pending release' },
  { id: 'completed', label: 'Completed' },
  { id: 'canceled', label: 'Canceled' },
  { id: 'failed', label: 'Failed' }
];

const profileTabs = ['Fees & pricing', 'Contact Telegram', 'Personal info', 'Security', 'Danger zone'];

function normalizeOrderStatus(status) {
  const value = String(status || '').toLowerCase().replace(/_/g, '-');

  if (['awaiting-confirmation', 'pending'].includes(value)) {
    return 'pending-release';
  }

  if (['processing', 'created', 'paid'].includes(value)) {
    return 'in-progress';
  }

  if (['completed', 'released', 'success', 'successful'].includes(value)) {
    return 'completed';
  }

  if (['cancelled', 'canceled'].includes(value)) {
    return 'canceled';
  }

  if (['failed', 'rejected'].includes(value)) {
    return 'failed';
  }

  return 'in-progress';
}

function formatOrderDate(value) {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return date.toLocaleString();
}

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
            ? 'bg-white/[0.16] text-[var(--tg-button-text-color)]'
            : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-button-color)]'
        }`}>
          <Icon size={22} />
        </div>
        {badge ? (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            accent ? 'bg-white/[0.16] text-white' : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-hint-color)]'
          }`}>
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 text-lg font-black tracking-[-0.03em]">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${accent ? 'text-white/[0.76]' : 'text-[var(--tg-subtitle-text-color)]'}`}>
        {body}
      </p>
      <div className="mt-5 flex items-center gap-2 text-sm font-black">
        Open
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function ServiceRail({ services }) {
  if (!services.length) {
    return null;
  }

  const railItems = [...services, ...services];

  return (
    <section className="overflow-hidden rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Service catalog</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Telegram-ready launch lanes</h3>
        </div>
        <Link
          to="/miniapp/services"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[var(--tg-secondary-bg-color)] text-[var(--tg-button-color)] transition active:scale-95"
          aria-label="Open service catalog"
        >
          <ArrowRight size={18} />
        </Link>
      </div>
      <div className="relative mt-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--tg-section-bg-color)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--tg-section-bg-color)] to-transparent" />
        <div className="flex w-max gap-3 motion-safe:animate-[transferlyServiceRail_38s_linear_infinite]">
          {railItems.map((service, index) => (
            <Link
              key={`${service.slug}-${index}`}
              to="/miniapp/services"
              className="flex w-56 shrink-0 items-center gap-3 rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-3 text-[var(--tg-text-color)] transition active:scale-[0.99]"
            >
              <ServiceLogo service={service} size="md" className="shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">{service.title}</span>
                <span className="mt-0.5 block truncate text-xs font-bold text-[var(--tg-hint-color)]">{service.category}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes transferlyServiceRail {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function LaunchPath() {
  return (
    <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">
        <Bot size={15} />
        Bot-first access
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {launchSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-black text-[var(--tg-hint-color)]">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-[var(--tg-text-color)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">{step.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProviderDock() {
  if (!providerHighlights.length) {
    return null;
  }

  return (
    <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Provider cockpit</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Live provider shortcuts</h3>
        </div>
        <Link
          to="/miniapp/ops"
          className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[var(--tg-button-color)] px-4 py-3 text-xs font-black text-[var(--tg-button-text-color)] transition active:scale-95"
        >
          Open
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {providerHighlights.map((provider) => (
          <Link
            key={provider.slug}
            to="/miniapp/ops"
            className="rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <ServiceLogo service={provider} size="md" />
              <span className="rounded-full bg-[var(--tg-section-bg-color)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
                {provider.badge}
              </span>
            </div>
            <h4 className="mt-4 truncate text-base font-black tracking-[-0.025em] text-[var(--tg-text-color)]">{provider.title}</h4>
            <p className="mt-1 truncate text-xs font-bold text-[var(--tg-hint-color)]">{provider.category}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MarketplaceBoard() {
  return (
    <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Premium service marketplace</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">All Transferly launch lanes</h3>
        </div>
        <Link
          to="/miniapp/services"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[var(--tg-secondary-bg-color)] text-[var(--tg-button-color)] transition active:scale-95"
          aria-label="Open full marketplace"
        >
          <ArrowRight size={18} />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {marketplaceLanes.map((lane) => {
          const Icon = lane.icon;
          return (
            <Link
              key={lane.title}
              to={lane.to}
              className="group rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4 text-[var(--tg-text-color)] transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] bg-[var(--tg-section-bg-color)] text-[var(--tg-button-color)]">
                  <Icon size={20} />
                </span>
                <span className="rounded-full bg-[var(--tg-section-bg-color)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
                  {lane.badge}
                </span>
              </div>
              <h4 className="mt-4 text-base font-black tracking-[-0.025em]">{lane.title}</h4>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">{lane.body}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--tg-button-color)]">
                Open
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function getMiniAppServiceTarget(service) {
  if (!service || service.status === 'comingSoon') {
    return '/miniapp/services';
  }

  return `/miniapp/services/${service.slug}`;
}

function getMiniAppLaunchTarget(service) {
  if (!service || service.status === 'comingSoon') {
    return '/miniapp/services';
  }

  if (service.launchTo?.startsWith('/miniapp')) {
    return service.launchTo;
  }

  if (service.launchTo?.startsWith('/dashboard/generate')) {
    const [, query = ''] = service.launchTo.split('?');
    return query ? `/miniapp/studio?${query}` : '/miniapp/studio';
  }

  if (service.launchTo?.startsWith('/transactions')) {
    return '/miniapp/vault';
  }

  if (service.launchTo?.startsWith('/services/')) {
    return service.category === 'Payment Providers' ? `/miniapp/ops?provider=${service.slug}` : `/miniapp/services/${service.slug}`;
  }

  return service.launchTo || `/miniapp/services/${service.slug}`;
}

function HeroPanel({ profile, telegram, receipts, topUpOrders }) {
  const firstName = telegram.user?.first_name || profile?.name?.split(' ')?.[0] || 'Operator';
  const latestOrder = topUpOrders[0];
  const balance = Number(profile?.points || 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[15px] font-semibold text-[var(--tg-subtitle-text-color)]">Welcome back,</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[var(--tg-text-color)] sm:text-4xl">
            {firstName}
          </h2>
        </div>
        <Link
          to="/miniapp/wallet"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tg-button-color)] px-5 py-3 text-sm font-black text-[var(--tg-button-text-color)] shadow-[0_14px_34px_rgba(248,129,45,0.26)] transition active:scale-95"
        >
          <Zap size={17} />
          Buy Points
        </Link>
      </div>

      <div className="overflow-hidden rounded-[30px] bg-[var(--tg-button-color)] p-5 text-[var(--tg-button-text-color)] shadow-[0_24px_58px_rgba(248,129,45,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Total Balance</p>
            <p className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
              {balance.toLocaleString()} pts
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.16]">
            <WalletCards size={22} />
          </span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: 'Services', value: miniAppServiceHighlights.length, icon: Sparkles, to: '/miniapp/services' },
            { label: 'Orders', value: topUpOrders.length, icon: CreditCard, to: '/miniapp/orders' },
            { label: 'History', value: receipts.length, icon: History, to: '/miniapp/vault' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-[22px] bg-white/[0.14] p-3 text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                <Icon size={18} />
                <span className="mt-3 block text-xl font-black tracking-[-0.04em]">{Number(item.value || 0).toLocaleString()}</span>
                <span className="mt-0.5 block text-[11px] font-black uppercase tracking-[0.12em] text-white/[0.72]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/miniapp/wallet"
          className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 text-[var(--tg-text-color)] transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]">
            <WalletCards size={22} />
          </span>
          <span className="mt-4 block text-lg font-black tracking-[-0.03em]">Buy Points</span>
          <span className="mt-1 block text-xs font-bold text-[var(--tg-hint-color)]">{latestOrder?.status || 'Wallet top-up'}</span>
        </Link>
        <Link
          to="/miniapp/support?from=vendor"
          className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 text-[var(--tg-text-color)] transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--tg-secondary-bg-color)] text-[var(--tg-button-color)]">
            <UserRound size={22} />
          </span>
          <span className="mt-4 block text-lg font-black tracking-[-0.03em]">Join Vendor</span>
          <span className="mt-1 block text-xs font-bold text-[var(--tg-hint-color)]">Support handoff</span>
        </Link>
      </div>
    </section>
  );
}

function FeaturedStrip() {
  const featured = ['ai-reply', 'articles', 'support-sites', 'opay']
    .map((slug) => getServiceBySlug(slug))
    .filter(Boolean);
  const primary = featured[0];
  const secondary = featured.slice(1);

  if (!primary) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">Featured</h3>
        <Link to="/miniapp/services" className="text-sm font-black text-[var(--tg-button-color)]">
          See all
        </Link>
      </div>
      <Link
        to={getMiniAppServiceTarget(primary)}
        className="group block overflow-hidden rounded-[30px] bg-[#2b211b] p-5 text-[var(--tg-text-color)] shadow-[0_18px_46px_rgba(0,0,0,0.24)] transition active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-4">
          <ServiceLogo service={primary} size="lg" />
          <span className="rounded-full bg-[var(--tg-button-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--tg-button-text-color)]">
            {primary.badge}
          </span>
        </div>
        <h4 className="mt-5 text-2xl font-black tracking-[-0.045em]">{primary.title}</h4>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--tg-subtitle-text-color)]">{primary.description}</p>
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--tg-button-color)]">
          Open
          <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </div>
      </Link>
      <div className="grid grid-cols-3 gap-3">
        {secondary.map((service) => (
          <Link
            key={service.slug}
            to={getMiniAppServiceTarget(service)}
            className="rounded-[24px] bg-[var(--tg-section-bg-color)] p-3 text-center text-[var(--tg-text-color)] transition active:scale-[0.98]"
          >
            <ServiceLogo service={service} size="md" className="mx-auto" />
            <span className="mt-3 block truncate text-xs font-black">{service.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AllServicesGrid() {
  const slugs = [
    'crypto-receipts',
    'paypal',
    'kuda',
    'cash-app',
    'zelle',
    'venmo',
    'trust-wallet',
    'wise',
    'faker-data',
    'wallet-tracker',
    'binance',
    'coinbase',
    'stripe',
    'paystack',
    'flutterwave',
    'crypto',
    'opay',
    'qr-code',
    'link-shortener',
    'articles'
  ];
  const services = slugs.map((slug) => getServiceBySlug(slug)).filter(Boolean);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">All Services</h3>
        <Link to="/miniapp/services" className="text-sm font-black text-[var(--tg-button-color)]">
          Explore
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
        {services.map((service) => (
          <Link
            key={service.slug}
            to={getMiniAppServiceTarget(service)}
            className="min-h-[104px] rounded-[22px] bg-[var(--tg-section-bg-color)] p-3 text-center text-[var(--tg-text-color)] transition hover:bg-[var(--tg-secondary-bg-color)] active:scale-[0.98]"
          >
            <ServiceLogo service={service} size="md" className="mx-auto" />
            <span className="mt-3 line-clamp-2 min-h-[26px] text-[11px] font-black leading-tight">{service.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ServiceCatalogTile({ service }) {
  const soon = service.status === 'comingSoon';

  return (
    <Link
      to={getMiniAppServiceTarget(service)}
      className="relative flex min-h-[112px] flex-col items-center justify-center rounded-[22px] bg-[var(--tg-secondary-bg-color)] p-3 text-center text-[var(--tg-text-color)] transition hover:bg-[#241d18] active:scale-[0.98]"
      aria-disabled={soon}
    >
      {service.badge ? (
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] ${
          soon
            ? 'bg-white/10 text-[var(--tg-hint-color)]'
            : 'bg-[color-mix(in_srgb,var(--tg-button-color)_18%,transparent)] text-[var(--tg-button-color)]'
        }`}>
          {service.badge}
        </span>
      ) : null}
      <ServiceLogo service={service} size="md" className="mx-auto" />
      <span className="mt-3 line-clamp-2 min-h-[26px] w-full text-[11px] font-black leading-tight">{service.title}</span>
    </Link>
  );
}

function ScriptCatalogTile({ service }) {
  return (
    <Link
      to={getMiniAppServiceTarget(service)}
      className="group block rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4 text-[var(--tg-text-color)] transition hover:bg-[#241d18] active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <ServiceLogo service={service} size="lg" />
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-black tracking-[-0.025em]">{service.title}</h4>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--tg-hint-color)]">
            {service.description}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--tg-section-bg-color)] px-3 py-2 text-[11px] font-black text-[var(--tg-button-color)]">
            View Details
            <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ServicesSection() {
  const aiReply = getServiceBySlug('ai-reply');

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h2 className="text-3xl font-black tracking-[-0.045em] text-[var(--tg-text-color)]">Services</h2>
      </section>

      {aiReply ? (
        <Link
          to={getMiniAppServiceTarget(aiReply)}
          className="group flex items-center gap-4 rounded-[30px] bg-[#2b211b] p-4 text-[var(--tg-text-color)] transition active:scale-[0.99]"
        >
          <ServiceLogo service={aiReply} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-base font-black leading-tight tracking-[-0.03em] sm:text-lg">{aiReply.title}</span>
              <span className="rounded-full bg-[var(--tg-button-color)] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--tg-button-text-color)]">
                New
              </span>
            </span>
            <span className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">{aiReply.description}</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-[var(--tg-button-color)] transition group-hover:translate-x-0.5" />
        </Link>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {miniAppServiceCategories.map((category) => {
          const services = category.slugs.map((slug) => getServiceBySlug(slug)).filter(Boolean);
          if (!services.length) {
            return null;
          }

          return (
            <section key={category.title} className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-black tracking-[-0.03em] text-[var(--tg-text-color)]">{category.title}</h3>
                {category.action ? (
                  <Link
                    to="/miniapp/orders"
                    className="shrink-0 rounded-full bg-[var(--tg-secondary-bg-color)] px-3 py-2 text-[11px] font-black text-[var(--tg-button-color)] transition active:scale-95"
                  >
                    {category.action}
                  </Link>
                ) : null}
              </div>
              <div className={category.featured ? 'grid gap-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3'}>
                {services.map((service) => (
                  category.featured
                    ? <ScriptCatalogTile key={service.slug} service={service} />
                    : <ServiceCatalogTile key={service.slug} service={service} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MiniAppPayPalSandboxServicePage({ service }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [moneyMenuOpen, setMoneyMenuOpen] = useState(false);
  const customMailTarget = '/miniapp/studio?type=email&service=paypal&mode=custom-mail';
  const depositMailTarget = '/miniapp/studio?type=email&service=paypal&mode=deposit-mail';
  const providerTarget = '/miniapp/ops?provider=paypal';

  return (
    <div className="min-h-screen bg-white text-[#0c0c0d]">
      <header className="sticky top-0 z-40 border-b border-[#d6d9dc] bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/miniapp/services/paypal" className="flex items-center gap-4 text-[#001c64]" aria-label="PayPal home page">
            <ServiceLogo service={service} size="md" />
            <span className="hidden h-7 w-px bg-[#d6d9dc] sm:block" aria-hidden="true" />
            <span className="text-[22px] font-bold text-[#2c2e2f]">Business Wallet</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="relative grid h-11 w-11 place-items-center rounded-full text-[#2c2e2f] transition hover:bg-[#f5f7fa] active:scale-95"
              aria-label="Notifications 0"
            >
              <Bell size={21} strokeWidth={2.2} />
              <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#0070e0] px-1 text-[11px] font-bold text-white">
                0
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((open) => {
                  if (open) {
                    setCreateMenuOpen(false);
                  }
                  return !open;
                });
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#c6cbd1] px-4 text-sm font-bold text-[#003087] transition hover:border-[#003087] hover:bg-[#f5f7fa] active:scale-95"
              aria-expanded={menuOpen}
              aria-controls="paypal-sandbox-menu"
            >
              Menu
              <ChevronDown size={16} className={menuOpen ? 'rotate-180 transition' : 'transition'} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="absolute left-0 right-0 top-[76px] z-50 px-4 sm:px-6">
            <div className="mx-auto flex max-w-[1180px] justify-end">
              <div
                id="paypal-sandbox-menu"
                className="relative max-h-[calc(100vh-96px)] w-full max-w-[410px] overflow-y-auto rounded-b-2xl border border-t-0 border-[#d6d9dc] bg-white p-2 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
              >
                <button
                  type="button"
                  onClick={() => setCreateMenuOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[15px] font-bold text-[#0c0c0d] transition hover:bg-[#f5f7fa]"
                  aria-expanded={createMenuOpen}
                  aria-controls="paypal-sandbox-create-menu"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef6ff] text-[#0070e0]">
                      <Plus size={18} />
                    </span>
                    Create
                  </span>
                  <ChevronDown size={17} className={createMenuOpen ? 'rotate-180 transition' : 'transition'} />
                </button>

                {createMenuOpen ? (
                  <div
                    id="paypal-sandbox-create-menu"
                    className="mb-2 rounded-xl border border-[#e0e3e7] bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.12)] sm:absolute sm:right-full sm:top-2 sm:mr-3 sm:w-72"
                  >
                    {paypalSandboxCreateItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-bold text-[#0c0c0d] transition hover:bg-[#f5f7fa]"
                        >
                          <Icon size={18} className="text-[#687173]" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}

                <nav className="mt-1 grid gap-0.5" aria-label="PayPal service navigation">
                  {paypalSandboxMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="flex items-center justify-between rounded-lg px-4 py-3 text-[15px] font-bold text-[#0c0c0d] transition hover:bg-[#f5f7fa]"
                      >
                        <span className="inline-flex min-w-0 items-center gap-3">
                          <Icon size={18} className="shrink-0 text-[#687173]" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.hasPanel ? <ArrowRight size={16} className="text-[#687173]" /> : null}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-2 border-t border-[#e0e3e7] pt-2">
                  <p className="px-4 py-2 text-[12px] font-bold text-[#687173]">Transferly service tools</p>
                  {paypalSandboxMailTasks.map((task) => (
                    <Link
                      key={task.label}
                      to={task.to}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[14px] font-bold text-[#003087] transition hover:bg-[#f5f7fa]"
                    >
                      {task.label}
                      <span className="rounded-full bg-[#eef6ff] px-2 py-0.5 text-[10px] font-bold text-[#0070e0]">
                        {task.badge}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-2 border-t border-[#e0e3e7] pt-2">
                  {paypalSandboxDeveloperTasks.map((task) => (
                    <Link
                      key={task.label}
                      to={task.to}
                      className="block rounded-lg px-4 py-2.5 text-[14px] font-bold text-[#003087] transition hover:bg-[#f5f7fa]"
                    >
                      {task.label}
                    </Link>
                  ))}
                  <Link
                    to="/miniapp"
                    className="mt-1 flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-bold text-[#0c0c0d] transition hover:bg-[#f5f7fa]"
                  >
                    <ArrowLeft size={18} className="text-[#687173]" />
                    Back to Transferly
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="flex items-end gap-3">
                    <h1 className="text-[44px] font-bold leading-none text-[#0c0c0d] sm:text-[54px]">$5,000.00</h1>
                    <p className="pb-1 text-2xl font-bold text-[#0c0c0d]">USD</p>
                  </div>
                  <p className="mt-3 text-[15px] font-semibold text-[#687173]">Available balance</p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMoneyMenuOpen((open) => !open)}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-[#0070e0] px-5 text-[15px] font-bold text-[#0070e0] transition hover:bg-[#f5faff] active:scale-95"
                    aria-expanded={moneyMenuOpen}
                  >
                    Manage money
                    <ChevronDown size={17} className={moneyMenuOpen ? 'rotate-180 transition' : 'transition'} />
                  </button>

                  {moneyMenuOpen ? (
                    <div className="absolute right-0 top-14 z-20 w-64 rounded-xl border border-[#d6d9dc] bg-white p-2 shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
                      <Link to="/miniapp/wallet?service=paypal" className="block rounded-lg px-3 py-2 text-sm font-bold text-[#003087] hover:bg-[#f5f7fa]">
                        Transfer to bank
                      </Link>
                      <Link to={providerTarget} className="block rounded-lg px-3 py-2 text-sm font-bold text-[#003087] hover:bg-[#f5f7fa]">
                        Manage currencies
                      </Link>
                      <Link to="/miniapp/activity?provider=paypal" className="block rounded-lg px-3 py-2 text-sm font-bold text-[#003087] hover:bg-[#f5f7fa]">
                        View activity
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <section className="mt-12">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-[#0c0c0d]">Quick access</h2>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-bold text-[#0070e0] hover:underline">
                  <Settings size={16} />
                  Edit your quick links
                </button>
              </div>
              <div className="mt-5 flex gap-4 overflow-x-auto pb-3" aria-label="Quick access">
                {paypalSandboxQuickAccessItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="group flex min-h-[132px] w-[138px] shrink-0 flex-col items-center justify-center rounded-xl border border-[#e0e3e7] bg-white px-3 py-4 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:border-[#0070e0] hover:shadow-[0_6px_18px_rgba(0,0,0,0.10)] active:scale-[0.98]"
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#eef6ff] text-[#0070e0] transition group-hover:bg-[#0070e0] group-hover:text-white">
                        <Icon size={22} />
                      </span>
                      <span className="mt-3 text-[13px] font-bold leading-4 text-[#003087]">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  type="button"
                  className="my-auto grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d6d9dc] text-[#003087] transition hover:bg-[#f5f7fa]"
                  aria-label="Scroll quick access right"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#0c0c0d]">Business Performance</h2>
                  <p className="mt-1 text-sm font-semibold text-[#687173]">All comparisons to previous 30 days</p>
                </div>
                <Link to="/miniapp/analytics?provider=paypal" className="text-sm font-bold text-[#0070e0] hover:underline">
                  View more
                </Link>
              </div>
              <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
                {paypalSandboxPerformanceCards.map((card) => (
                    <article key={card.label} className="min-h-[154px] w-[230px] shrink-0 rounded-xl border border-[#e0e3e7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                      <Link to={card.to} className="text-sm font-bold leading-5 text-[#003087] hover:underline">
                        {card.label}
                      </Link>
                      <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#fff7f5] p-3 text-[#8f2b0f]" role="alert">
                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                        <p className="text-[13px] font-semibold leading-5">Something went wrong, please try again later</p>
                      </div>
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0070e0] transition hover:underline active:scale-95"
                      >
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </article>
                ))}
                <button
                  type="button"
                  className="my-auto grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d6d9dc] text-[#003087] transition hover:bg-[#f5f7fa]"
                  aria-label="Scroll business performance right"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-[#0c0c0d]">Recent activity</h2>
                <Link to="/miniapp/activity?provider=paypal" className="text-sm font-bold text-[#0070e0] hover:underline">
                  View Activity
                </Link>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#e0e3e7] bg-white">
                <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-sm">
                  <tbody>
                    {paypalSandboxActivityRows.map((row) => (
                      <tr key={`${row.date}-${row.type}-${row.amount}`} className="font-semibold text-[#0c0c0d] transition hover:bg-[#f8f9fb]">
                        <td className="border-b border-[#edf0f2] px-5 py-4 text-[#687173]">{row.date}</td>
                        <td className="border-b border-[#edf0f2] px-5 py-4">{row.type}</td>
                        <td className="border-b border-[#edf0f2] px-5 py-4">{row.name}</td>
                        <td className="border-b border-[#edf0f2] px-5 py-4 text-right font-bold">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="lg:pt-28">
            <p className="mb-3 text-[15px] font-bold text-[#2c2e2f]">Quick actions</p>
            <section className="rounded-xl border border-[#e0e3e7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold leading-tight text-[#0c0c0d]">Create a Payment Link</h2>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full text-[#687173] transition hover:bg-[#f5f7fa] hover:text-[#0c0c0d]"
                  aria-label="Dismiss payment link action"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#687173]">
                Make a shareable link so you can get paid by email, text, or on social media.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-[#2c2e2f]">Product or service name</span>
                  <input
                    type="text"
                    className="mt-2 h-12 w-full rounded border border-[#92979d] bg-white px-3 text-base font-semibold text-[#0c0c0d] outline-none transition focus:border-[#0070e0] focus:ring-2 focus:ring-[#0070e0]/20"
                  />
                </label>

                <div className="grid grid-cols-[1fr_112px] gap-3">
                  <label className="block">
                    <span className="text-sm font-bold text-[#2c2e2f]">Price</span>
                    <div className="mt-2 flex h-12 overflow-hidden rounded border border-[#92979d] bg-white focus-within:border-[#0070e0] focus-within:ring-2 focus-within:ring-[#0070e0]/20">
                      <span className="grid w-10 place-items-center text-base font-bold text-[#687173]">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="min-w-0 flex-1 border-0 px-0 text-base font-semibold text-[#0c0c0d] outline-none"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-[#2c2e2f]">Currency</span>
                    <select
                      defaultValue="USD"
                      className="mt-2 h-12 w-full rounded border border-[#92979d] bg-white px-3 text-base font-bold text-[#0c0c0d] outline-none transition focus:border-[#0070e0] focus:ring-2 focus:ring-[#0070e0]/20"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <Link
                  to={customMailTarget}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#0070e0] px-5 text-base font-bold text-white transition hover:bg-[#003087] active:scale-95"
                >
                  Build It
                </Link>
                <Link
                  to={depositMailTarget}
                  className="inline-flex h-10 items-center justify-center text-base font-bold text-[#0070e0] transition hover:underline active:scale-95"
                >
                  Customize
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </main>

      <footer className="border-t border-[#e0e3e7] bg-[#f7f9fa]">
        <div className="mx-auto max-w-[1180px] px-4 py-8 text-sm sm:px-6">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {paypalSandboxFooterLinks.map((label) => (
              <Link key={label} to={label === 'Developers' ? providerTarget : '/miniapp/support'} className="font-bold text-[#003087] hover:underline">
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
            {paypalSandboxLanguageLinks.map((label) => (
              <button key={label} type="button" className="font-bold text-[#003087] hover:underline">
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#687173]">
            <p>Copyright © 1999-2026 PayPal. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link to="/miniapp/support" className="hover:text-[#003087] hover:underline">Privacy</Link>
              <Link to="/miniapp/support" className="hover:text-[#003087] hover:underline">Legal</Link>
              <Link to="/miniapp/support" className="hover:text-[#003087] hover:underline">Policy updates</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MiniAppMailServicePicker({ service }) {
  if (service.slug === 'paypal') {
    return <MiniAppPayPalSandboxServicePage service={service} />;
  }

  const customMailTarget = `/miniapp/studio?type=email&service=${service.slug}&mode=custom-mail`;
  const depositMailTarget = `/miniapp/studio?type=email&service=${service.slug}&mode=deposit-mail`;
  const historyTarget = `/miniapp/vault?service=${service.slug}`;
  const providerTarget = getMiniAppLaunchTarget(service);
  const showProviderLink = service.category === 'Payment Providers';

  const actions = [
    { label: 'Custom Mail', to: customMailTarget, icon: FileText },
    { label: 'Deposit Mail', to: depositMailTarget, icon: CreditCard },
    { label: 'Mail History', to: historyTarget, icon: History }
  ];

  return (
    <div className="mx-auto max-w-md space-y-4">
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] px-5 py-7 text-center shadow-sm">
        <ServiceLogo service={service} size="lg" className="mx-auto" />
        <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{service.title}</h2>
        <p className="mt-2 text-sm font-bold text-[var(--tg-subtitle-text-color)]">Choose the type of mail to Send</p>

        <div className="mt-6 space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex min-h-[58px] items-center justify-between gap-3 rounded-[20px] bg-[var(--tg-secondary-bg-color)] px-4 text-left text-[var(--tg-text-color)] transition hover:bg-[color-mix(in_srgb,var(--tg-secondary-bg-color),var(--tg-button-color)_8%)] active:scale-[0.98]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-[var(--tg-section-bg-color)] text-[var(--tg-button-color)]">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-black">{action.label}</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-[var(--tg-button-color)] transition group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>

        {showProviderLink ? (
          <Link
            to={providerTarget}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tg-button-color)] px-4 py-3 text-xs font-black text-[var(--tg-button-text-color)] transition active:scale-95"
          >
            Open {service.title} provider workspace
            <ShieldCheck size={15} />
          </Link>
        ) : null}
      </section>

      <Link
        to="/miniapp"
        className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[var(--tg-section-bg-color)] px-4 py-2 text-sm font-black text-[var(--tg-button-color)] transition active:scale-95"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}

function MiniAppServiceDetail({ slug, profile, config }) {
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="space-y-4">
        <Link
          to="/miniapp/services"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--tg-section-bg-color)] px-4 py-2 text-sm font-black text-[var(--tg-button-color)] transition active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to Services
        </Link>
        <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Missing service</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Service not found</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
            This catalog entry is not available in the Transferly mini app.
          </p>
        </section>
      </div>
    );
  }

  if (miniAppMailServiceSlugs.has(service.slug)) {
    return <MiniAppMailServicePicker service={service} />;
  }

  const preview = getServicePreview(service);
  const estimatedCost = getServiceEstimatedCost(service, config);
  const recommendedPacks = getRecommendedPointPacks(service, config);
  const relatedServices = getRelatedServices(service.slug, 3);
  const points = Number(profile?.points || 0);
  const needsTopUp = estimatedCost !== null && points < estimatedCost;
  const launchTarget = getMiniAppLaunchTarget(service);
  const isLive = service.status === 'available';
  const launchLabel = service.launchLabel || 'Open Service';

  return (
    <div className="space-y-4">
      <Link
        to="/miniapp/services"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--tg-section-bg-color)] px-4 py-2 text-sm font-black text-[var(--tg-button-color)] transition active:scale-95"
      >
        <ArrowLeft size={16} />
        Back to Services
      </Link>

      <section
        className="overflow-hidden rounded-[32px] p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
        style={{ background: `linear-gradient(135deg, ${service.accent?.bg || '#111827'}, #2b211b)` }}
      >
        <div className="flex items-start justify-between gap-4">
          <ServiceLogo service={service} size="lg" />
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
            {service.badge || service.category}
          </span>
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-white/65">{preview.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{service.title}</h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/76">{service.description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isLive ? (
            <Link
              to={launchTarget}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#17120e] transition active:scale-95"
            >
              {launchLabel}
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-black text-white/60"
            >
              Coming Soon
            </button>
          )}
          {needsTopUp ? (
            <Link
              to={`/miniapp/wallet?service=${service.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-black text-white transition active:scale-95"
            >
              Buy Points
              <Zap size={16} />
            </Link>
          ) : null}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <section className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Status</p>
          <p className="mt-3 text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">
            {isLive ? 'Available' : 'Coming soon'}
          </p>
        </section>
        <section className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Estimated cost</p>
          <p className="mt-3 text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">
            {estimatedCost === null ? 'No points' : `${estimatedCost.toLocaleString()} pts`}
          </p>
        </section>
        <section className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Balance</p>
          <p className="mt-3 text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">
            {points.toLocaleString()} pts
          </p>
        </section>
      </div>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <h3 className="text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">{preview.headline}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">{service.detail}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {preview.bullets.map((bullet) => (
            <div key={bullet} className="rounded-[22px] bg-[var(--tg-secondary-bg-color)] px-4 py-4 text-sm font-bold leading-6 text-[var(--tg-subtitle-text-color)]">
              {bullet}
            </div>
          ))}
        </div>
      </section>

      {estimatedCost !== null ? (
        <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Recommended packs</p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">
                {needsTopUp ? 'Top up before launch' : 'Ready to launch'}
              </h3>
            </div>
            <Link to={`/miniapp/wallet?service=${service.slug}`} className="text-sm font-black text-[var(--tg-button-color)]">
              Open wallet
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recommendedPacks.map((pack) => (
              <div key={pack} className="rounded-[22px] bg-[var(--tg-secondary-bg-color)] px-4 py-4 text-center">
                <p className="text-lg font-black tracking-[-0.035em] text-[var(--tg-text-color)]">{pack.toLocaleString()}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">points</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {relatedServices.length ? (
        <section className="space-y-3">
          <h3 className="text-xl font-black tracking-[-0.035em] text-[var(--tg-text-color)]">Related Services</h3>
          <div className="grid grid-cols-3 gap-3">
            {relatedServices.map((related) => (
              <Link
                key={related.slug}
                to={getMiniAppServiceTarget(related)}
                className="rounded-[24px] bg-[var(--tg-section-bg-color)] p-3 text-center text-[var(--tg-text-color)] transition active:scale-[0.98]"
              >
                <ServiceLogo service={related} size="md" className="mx-auto" />
                <span className="mt-3 block truncate text-xs font-black">{related.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HomeSection({ profile, telegram, receipts, topUpOrders }) {
  return (
    <div className="space-y-5">
      <HeroPanel profile={profile} telegram={telegram} receipts={receipts} topUpOrders={topUpOrders} />
      <FeaturedStrip />
      <AllServicesGrid />
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
  const [query, setQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState(supportFaqs[0]?.question || '');
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

  const filteredFaqs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return supportFaqs;
    }

    return supportFaqs.filter((faq) => {
      const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

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
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">
          <Search size={15} />
          Help search
        </div>
        <label className="mt-4 flex items-center gap-3 rounded-[22px] bg-[var(--tg-secondary-bg-color)] px-4 py-3">
          <Search size={18} className="text-[var(--tg-hint-color)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search support topics"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[var(--tg-text-color)] outline-none placeholder:text-[var(--tg-hint-color)]"
          />
        </label>
        <div className="mt-4 space-y-2">
          {filteredFaqs.length ? filteredFaqs.map((faq) => {
            const open = openQuestion === faq.question;
            return (
              <button
                key={faq.question}
                type="button"
                onClick={() => setOpenQuestion(open ? '' : faq.question)}
                className="w-full rounded-[22px] bg-[var(--tg-secondary-bg-color)] p-4 text-left transition active:scale-[0.99]"
                aria-expanded={open}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--tg-button-color)]" />
                    <span className="text-sm font-black leading-6 text-[var(--tg-text-color)]">{faq.question}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-[var(--tg-hint-color)] transition ${open ? 'rotate-180' : ''}`}
                  />
                </span>
                {open ? (
                  <span className="mt-3 block pl-8 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
                    {faq.answer}
                  </span>
                ) : null}
              </button>
            );
          }) : (
            <div className="rounded-[22px] bg-[var(--tg-secondary-bg-color)] p-4 text-sm font-bold text-[var(--tg-hint-color)]">
              No support topics matched. Copy the support context and send it to the bot/admin.
            </div>
          )}
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <ActionCard icon={CreditCard} title="Funding issue" body="Review wallet orders, point release state, and funding context." to="/miniapp/wallet" badge="Points" />
        <ActionCard icon={Receipt} title="Receipt issue" body="Open vault, choose a receipt, and attach details." to="/miniapp/vault" badge="Vault" />
        <ActionCard icon={Bot} title="Bot access" body="Check Telegram identity and access state before support escalation." to="/miniapp/profile" badge={telegram.available ? 'Verified' : 'Preview'} />
        <ActionCard icon={LifeBuoy} title="Help center" body="Use the existing FAQ and help page while Mini App support grows." to="/help" badge="FAQ" />
      </div>
    </div>
  );
}

function OrdersSection({ topUpOrders, telegram }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts = useMemo(() => {
    return orderFilterOptions.reduce((acc, option) => {
      acc[option.id] = option.id === 'all'
        ? topUpOrders.length
        : topUpOrders.filter((order) => normalizeOrderStatus(order.status) === option.id).length;
      return acc;
    }, {});
  }, [topUpOrders]);

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return topUpOrders.filter((order) => {
      const normalizedStatus = normalizeOrderStatus(order.status);
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      const haystack = [
        order.order_id,
        order.id,
        order.amount_label,
        order.points,
        order.method_title,
        order.status
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [query, statusFilter, topUpOrders]);

  const goToOrder = () => {
    const value = orderNumber.trim();
    if (!value) {
      toast.error('Enter order number');
      telegram.notify('error');
      return;
    }

    setQuery(value);
    setStatusFilter('all');
    telegram.impact('light');
  };

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h2 className="text-3xl font-black tracking-[-0.045em] text-[var(--tg-text-color)]">Orders</h2>
        <p className="text-sm font-semibold text-[var(--tg-subtitle-text-color)]">Track point orders, release status, and vendor handoff records.</p>
      </section>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex items-center gap-3 rounded-[22px] bg-[var(--tg-secondary-bg-color)] px-4 py-3">
            <Search size={18} className="shrink-0 text-[var(--tg-hint-color)]" />
            <input
              type="search"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  goToOrder();
                }
              }}
              placeholder="Enter order number"
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[var(--tg-text-color)] outline-none placeholder:text-[var(--tg-hint-color)]"
            />
          </label>
          <button
            type="button"
            onClick={goToOrder}
            className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[var(--tg-button-color)] px-5 py-3 text-sm font-black text-[var(--tg-button-text-color)] transition active:scale-95"
          >
            Go to order
            <ArrowRight size={16} />
          </button>
        </div>

        <label className="mt-3 flex items-center gap-3 rounded-[22px] bg-[var(--tg-secondary-bg-color)] px-4 py-3">
          <Search size={18} className="shrink-0 text-[var(--tg-hint-color)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by Order number or amount"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[var(--tg-text-color)] outline-none placeholder:text-[var(--tg-hint-color)]"
          />
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {orderFilterOptions.map((option) => {
            const active = statusFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setStatusFilter(option.id);
                  telegram.impact('light');
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition active:scale-95 ${
                  active
                    ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
                    : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-hint-color)]'
                }`}
                aria-pressed={active}
              >
                {option.label} {Number(counts[option.id] || 0).toLocaleString()}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        {filteredOrders.length ? filteredOrders.map((order) => {
          const normalizedStatus = normalizeOrderStatus(order.status);
          const statusLabel = orderFilterOptions.find((option) => option.id === normalizedStatus)?.label || 'In progress';

          return (
            <article key={order.order_id || order.id} className="rounded-[26px] bg-[var(--tg-section-bg-color)] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--tg-text-color)]">{order.order_id || order.id || 'Order'}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--tg-hint-color)]">{formatOrderDate(order.created_at)}</p>
                </div>
                <span className="rounded-full bg-[var(--tg-secondary-bg-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--tg-button-color)]">
                  {statusLabel}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] bg-[var(--tg-secondary-bg-color)] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">Amount</p>
                  <p className="mt-1 text-sm font-black text-[var(--tg-text-color)]">
                    {order.amount_label || `${Number(order.points || 0).toLocaleString()} pts`}
                  </p>
                </div>
                <div className="rounded-[20px] bg-[var(--tg-secondary-bg-color)] p-3 sm:col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">Method</p>
                  <p className="mt-1 truncate text-sm font-black text-[var(--tg-text-color)]">{order.method_title || 'Funding method'}</p>
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[28px] bg-[var(--tg-section-bg-color)] p-8 text-center shadow-sm">
            <CreditCard className="mx-auto text-[var(--tg-button-color)]" size={30} />
            <p className="mt-3 text-sm font-black text-[var(--tg-text-color)]">No orders yet</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[var(--tg-hint-color)]">
              Point orders created from Buy Points will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileSection({ telegram, profile, user }) {
  const [activeTab, setActiveTab] = useState('Personal info');
  const referralCode = profile?.referral_code || 'Not assigned';
  const telegramName = [telegram.user?.first_name, telegram.user?.last_name].filter(Boolean).join(' ');
  const displayName = telegramName || profile?.name || user?.name || 'Guest preview';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0].toUpperCase())
    .join('') || displayName.slice(0, 1).toUpperCase();
  const username = telegram.user?.username ? `@${telegram.user.username}` : profile?.username || user?.username || 'Not connected';
  const email = user?.email || profile?.email || 'Telegram miniapp user';
  const memberSince = formatOrderDate(profile?.created_at || user?.created_at);
  const points = Number(profile?.points || 0);
  const phoneCountryOptions = ['NG', 'US', 'GB', 'CA', 'GH', 'KE', 'ZA'];
  const storedPhoneCountry = profile?.phone_country || profile?.country || user?.country || 'NG';
  const phoneCountry = phoneCountryOptions.includes(storedPhoneCountry) ? storedPhoneCountry : 'NG';
  const whatsAppNumber = profile?.whatsapp || profile?.phone || user?.phone || '';
  const referralLink = referralCode !== 'Not assigned'
    ? `https://t.me/TransferlyBot?start=${referralCode}`
    : referralCode;

  const copyReferral = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      telegram.notify('success');
      toast.success('Referral link copied');
    } catch (_error) {
      toast.error('Unable to copy referral link');
    }
  }, [referralLink, telegram]);

  const saveProfilePreview = () => {
    telegram.impact('light');
    toast.success('Profile preferences saved');
  };

  const logoutPreview = () => {
    telegram.notify('success');
    toast.success('Telegram mini app sessions are controlled by the bot');
  };

  useEffect(() => {
    return telegram.configureMainButton?.({
      text: 'Copy Ref Link',
      enabled: referralCode !== 'Not assigned',
      onClick: copyReferral
    });
  }, [copyReferral, referralCode, telegram]);

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--tg-button-color)] text-xl font-black text-[var(--tg-button-text-color)]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Account identity</p>
            <h2 className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">
              {displayName}
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--tg-hint-color)]">
              {username}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--tg-secondary-bg-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
                USER
              </span>
              <span className="rounded-full bg-[var(--tg-secondary-bg-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard icon={UserRound} label="User role" value="USER" tone={user ? 'accent' : 'warn'} />
        <StatCard icon={WalletCards} label="Total balance" value={`${points.toLocaleString()} pts`} tone="accent" />
        <StatCard icon={CreditCard} label="Naira/pt" value="₦1" />
        <StatCard icon={Star} label="Referrals" value={Number(profile?.referral_count || 0).toLocaleString()} />
        <button
          type="button"
          onClick={copyReferral}
          className="rounded-[24px] bg-[var(--tg-section-bg-color)] p-4 text-left shadow-sm transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
            <Copy size={15} />
            Copy Ref Link
          </div>
          <p className="mt-3 break-all text-lg font-black tracking-[-0.03em] text-[var(--tg-text-color)]">{referralCode}</p>
        </button>
      </div>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Referral</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Invite and earn</h3>
          </div>
          <button
            type="button"
            onClick={copyReferral}
            className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[var(--tg-button-color)] px-4 py-3 text-xs font-black text-[var(--tg-button-text-color)] transition active:scale-95"
          >
            <Copy size={15} />
            Copy
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4">
            <p className="text-xs font-black text-[var(--tg-button-color)]">01</p>
            <h4 className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--tg-text-color)]">Share the Love</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
              Send your Transferly bot referral link to trusted customers and operators.
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4">
            <p className="text-xs font-black text-[var(--tg-button-color)]">02</p>
            <h4 className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--tg-text-color)]">Get Rewarded</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
              Track referred users and keep rewards visible inside the miniapp profile.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Profile Information</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{displayName}</h3>
          </div>
          <span className="rounded-full bg-[var(--tg-secondary-bg-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">
            {telegram.available ? 'Telegram' : 'Preview'}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['Name', displayName],
            ['Email', email],
            ['Username', username]
          ].map(([label, value]) => (
            <label key={label}>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">{label}</span>
              <input
                value={value}
                readOnly
                className="mt-2 w-full rounded-[18px] border border-black/5 bg-[var(--tg-secondary-bg-color)] px-4 py-3 text-sm font-bold text-[var(--tg-text-color)] outline-none"
              />
            </label>
          ))}
          <label>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Phone number country</span>
            <select
              value={phoneCountry}
              onChange={() => {}}
              className="mt-2 w-full rounded-[18px] border border-black/5 bg-[var(--tg-secondary-bg-color)] px-4 py-3 text-sm font-bold text-[var(--tg-text-color)] outline-none"
              aria-label="Phone number country"
            >
              {phoneCountryOptions.map((countryCode) => (
                <option key={countryCode} value={countryCode}>{countryCode}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">WhatsApp Number</span>
            <input
              value={whatsAppNumber}
              readOnly
              placeholder="Enter Phone Number"
              className="mt-2 w-full rounded-[18px] border border-black/5 bg-[var(--tg-secondary-bg-color)] px-4 py-3 text-sm font-bold text-[var(--tg-text-color)] outline-none placeholder:text-[var(--tg-hint-color)]"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {profileTabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  telegram.impact('light');
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition active:scale-95 ${
                  active
                    ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
                    : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-hint-color)]'
                }`}
                aria-pressed={active}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-[22px] bg-[var(--tg-secondary-bg-color)] p-4">
          <p className="text-sm font-black text-[var(--tg-text-color)]">{activeTab}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--tg-subtitle-text-color)]">
            {activeTab === 'Fees & pricing' ? 'Review point costs and current service pricing from the miniapp workspace.' : null}
            {activeTab === 'Contact Telegram' ? 'Use bot-first support and verified Telegram handoff for account changes.' : null}
            {activeTab === 'Personal info' ? 'Profile details are read from Telegram and the linked Transferly account.' : null}
            {activeTab === 'Security' ? 'Sessions, identity, and sensitive actions stay tied to the Telegram launch context.' : null}
            {activeTab === 'Danger zone' ? 'Account-level destructive actions require support verification outside this preview.' : null}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={saveProfilePreview}
            className="rounded-[20px] bg-[var(--tg-button-color)] px-5 py-3 text-sm font-black text-[var(--tg-button-text-color)] transition active:scale-95"
          >
            Save
          </button>
          <button
            type="button"
            onClick={logoutPreview}
            className="rounded-[20px] bg-[var(--tg-secondary-bg-color)] px-5 py-3 text-sm font-black text-[var(--tg-text-color)] transition active:scale-95"
          >
            Logout
          </button>
        </div>
      </section>
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
  const { section = 'home', slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const telegram = useTelegramMiniApp();
  const {
    config,
    user,
    profile,
    receipts,
    topUpOrders,
    paymentIssues
  } = useAppContext();
  const activeSection = sectionMeta[section] ? section : 'home';
  const queryService = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('service') || '';
  }, [location.search]);
  const activeServiceSlug = activeSection === 'services' ? (slug || queryService) : '';
  const activeService = activeServiceSlug ? getServiceBySlug(activeServiceSlug) : null;
  const isPayPalSandboxService = activeSection === 'services' && activeServiceSlug === 'paypal';
  const meta = activeService
    ? { title: activeService.title, subtitle: 'Service details' }
    : sectionMeta[activeSection];

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
      case 'services':
        return { text: 'Open Studio', action: () => navigate('/miniapp/studio') };
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
      case 'orders':
        return { text: 'Search Orders', action: () => navigate('/miniapp/orders') };
      case 'wallet':
        return { text: 'Create Point Order', action: () => navigate('/buy-point') };
      case 'ops':
        return { text: profile?.is_admin ? 'Open Admin Ops' : 'Request Access', action: () => navigate(profile?.is_admin ? '/admin' : '/miniapp/support') };
      default:
        return { text: 'Generate Receipt', action: () => navigate('/miniapp/studio') };
    }
  }, [activeSection, navigate, profile?.is_admin]);

  useEffect(() => {
    if (['studio', 'vault', 'orders', 'wallet', 'support', 'profile', 'settings'].includes(activeSection)) {
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
    <MiniAppShell title={meta.title} subtitle={meta.subtitle} immersive={isPayPalSandboxService}>
      {activeSection === 'home' ? (
        <HomeSection profile={profile} telegram={telegram} receipts={receipts} topUpOrders={topUpOrders} />
      ) : null}
      {activeSection === 'services' ? (
        activeServiceSlug
          ? <MiniAppServiceDetail slug={activeServiceSlug} profile={profile} config={config} />
          : <ServicesSection />
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
      {activeSection === 'orders' ? <OrdersSection topUpOrders={topUpOrders} telegram={telegram} /> : null}
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
