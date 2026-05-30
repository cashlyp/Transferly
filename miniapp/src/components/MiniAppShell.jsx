import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Bell, Bot, ChevronLeft, CircleDollarSign, FileClock, FileText, Home, LifeBuoy, PlusCircle, Send, Settings, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTelegramMiniApp } from '../context/TelegramMiniAppContext';

const navItems = [
  { label: 'Home', to: '/miniapp', icon: Home },
  { label: 'Invoice', to: '/miniapp/invoices', icon: FileText },
  { label: 'Payout', to: '/miniapp/payouts', icon: Send },
  { label: 'Wallet', to: '/miniapp/wallet', icon: WalletCards },
  { label: 'Ops', to: '/miniapp/ops', icon: ShieldCheck }
];

const workspaceItems = [
  { label: 'Studio', to: '/miniapp/studio', icon: PlusCircle },
  { label: 'Vault', to: '/miniapp/vault', icon: FileText },
  { label: 'Activity', to: '/miniapp/activity', icon: Activity },
  { label: 'Analytics', to: '/miniapp/analytics', icon: BarChart3 },
  { label: 'Alerts', to: '/miniapp/notifications', icon: Bell },
  { label: 'Clients', to: '/miniapp/clients', icon: UserRound },
  { label: 'Security', to: '/miniapp/security', icon: ShieldCheck }
];

function formatName(telegramUser, profile, user) {
  const telegramName = [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' ');
  return telegramName || profile?.name || user?.name || user?.email || 'Transferly user';
}

function getSessionLabel(telegram, telegramAuthState) {
  if (!telegram.available) {
    return 'Browser preview mode';
  }

  if (telegramAuthState === 'authenticated') {
    return 'Telegram session secured';
  }

  if (telegramAuthState === 'authenticating') {
    return 'Securing Telegram session';
  }

  if (telegramAuthState === 'failed') {
    return 'Telegram sign-in needs retry';
  }

  return 'Telegram session detected';
}

export default function MiniAppShell({ children, title = 'Transferly Mini App', subtitle = 'Telegram-native command center' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, telegramAuthState } = useAppContext();
  const telegram = useTelegramMiniApp();
  const isRoot = location.pathname === '/miniapp';
  const displayName = formatName(telegram.user, profile, user);
  const sessionLabel = getSessionLabel(telegram, telegramAuthState);
  const points = Number(profile?.points || 0);
  const currentScreen = isRoot ? 'home' : location.pathname.replace('/miniapp/', '') || 'home';
  const supportPath = `/miniapp/support?from=${encodeURIComponent(currentScreen)}`;
  const settingsPath = `/miniapp/settings?from=${encodeURIComponent(currentScreen)}`;

  useEffect(() => {
    const backButton = telegram.webApp?.BackButton;
    if (!backButton) {
      return undefined;
    }

    const handleBack = () => {
      if (window.history.length > 1 && !isRoot) {
        navigate(-1);
      } else {
        navigate('/miniapp');
      }
    };

    if (isRoot) {
      backButton.hide?.();
    } else {
      backButton.show?.();
    }

    backButton.onClick?.(handleBack);

    return () => {
      backButton.offClick?.(handleBack);
    };
  }, [isRoot, navigate, telegram.webApp]);

  useEffect(() => {
    const cleanup = telegram.configureSettingsButton?.({
      visible: true,
      onClick: () => {
        telegram.impact('light');
        navigate(settingsPath);
      }
    });

    return () => {
      cleanup?.();

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/miniapp')) {
        telegram.webApp?.SettingsButton?.hide?.();
      }
    };
  }, [navigate, settingsPath, telegram]);

  return (
    <div className="min-h-screen bg-[var(--tg-bg-color)] text-[var(--tg-text-color)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col pb-[calc(84px+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-[color-mix(in_srgb,var(--tg-bg-color)_88%,transparent)] px-4 py-3 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (isRoot ? telegram.webApp?.close?.() : navigate(-1))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tg-secondary-bg-color)] text-[var(--tg-text-color)] shadow-sm transition active:scale-95"
              aria-label={isRoot ? 'Close Mini App' : 'Go back'}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">
                {subtitle}
              </p>
              <h1 className="truncate text-lg font-black tracking-[-0.03em] text-[var(--tg-text-color)]">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={supportPath}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tg-secondary-bg-color)] text-[var(--tg-text-color)] shadow-sm transition active:scale-95"
                aria-label="Support"
              >
                <LifeBuoy size={18} />
              </Link>
              <Link
                to={settingsPath}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tg-secondary-bg-color)] text-[var(--tg-text-color)] shadow-sm transition active:scale-95"
                aria-label="Settings"
              >
                <Settings size={18} />
              </Link>
              <Link
                to="/miniapp/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)] shadow-sm transition active:scale-95"
                aria-label="Profile"
              >
                <UserRound size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <div className="min-w-0 rounded-2xl bg-[var(--tg-section-bg-color)] px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--tg-hint-color)]">
                <Bot size={14} />
                {sessionLabel}
              </div>
              <p className="mt-1 truncate text-sm font-black text-[var(--tg-text-color)]">{displayName}</p>
            </div>
            <div className="rounded-2xl bg-[var(--tg-section-bg-color)] px-4 py-3 text-right shadow-sm">
              <div className="flex items-center justify-end gap-2 text-xs font-bold text-[var(--tg-hint-color)]">
                <CircleDollarSign size={14} />
                Points
              </div>
              <p className="mt-1 text-sm font-black text-[var(--tg-text-color)]">{points.toLocaleString()}</p>
            </div>
          </div>

          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => telegram.impact('light')}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[11px] font-black transition active:scale-[0.98] ${
                    active
                      ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
                      : 'bg-[var(--tg-section-bg-color)] text-[var(--tg-hint-color)]'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-[color-mix(in_srgb,var(--tg-bottom-bar-bg-color)_94%,transparent)] px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
          <div className="mx-auto grid max-w-[760px] grid-cols-5 gap-1 rounded-[26px] bg-[var(--tg-section-bg-color)] p-1 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.to === '/miniapp'
                ? location.pathname === '/miniapp'
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => telegram.impact('light')}
                  className={`flex h-14 flex-col items-center justify-center gap-1 rounded-[20px] text-[10px] font-black transition active:scale-[0.98] ${
                    active
                      ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
                      : 'text-[var(--tg-hint-color)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="pointer-events-none fixed right-4 top-[132px] hidden rounded-full border border-black/5 bg-[var(--tg-section-bg-color)] px-3 py-2 text-xs font-black text-[var(--tg-hint-color)] shadow-lg sm:flex sm:items-center sm:gap-2">
          <Bell size={14} />
          Live ops ready
        </div>

        <Link
          to="/transactions"
          className="sr-only"
          aria-label="Open full web history"
        >
          <FileClock size={16} />
        </Link>
      </div>
    </div>
  );
}
