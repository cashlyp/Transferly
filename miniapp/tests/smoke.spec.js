import { expect, test } from '@playwright/test';

const adminUser = {
  id: 'admin-user',
  email: 'admin@transferly.test',
  displayName: 'Admin Operator',
  isAdmin: true
};

const adminProfile = {
  id: 'admin-user',
  name: 'Admin Operator',
  is_admin: true,
  points: 5000,
  wallet: {
    currencyCode: 'USD',
    availableBalanceCents: 125000,
    pendingBalanceCents: 18000,
    frozenBalanceCents: 5000,
    paidOutBalanceCents: 74000
  }
};

const invoiceRecord = {
  internal_invoice_id: 'inv_internal_1001',
  invoice_id: 'PAYPAL-INV-1001',
  provider: 'paypal',
  status: 'SENT',
  summary: {
    invoice_number: 'INV-1001',
    recipient_email: 'buyer@example.com',
    amount: '150.00',
    currency: 'USD',
    issue_date: '2026-05-10',
    due_date: '2026-05-17',
    auto_reminders_cancelled_at: null
  },
  official_paypal: {
    last_synced_at: '2026-05-10T12:00:00.000Z',
    qr: {
      image_url_png: 'https://example.test/invoice-qr.png'
    }
  },
  metadata: {}
};

const stripeInvoiceRecord = {
  internal_invoice_id: 'stripe_invoice_1002',
  invoice_id: 'STRIPE-INV-1002',
  provider: 'stripe',
  status: 'PAID',
  summary: {
    invoice_number: 'INV-1002',
    recipient_email: 'stripe-buyer@example.com',
    amount: '321.50',
    currency: 'USD',
    issue_date: '2026-05-11',
    due_date: '2026-05-18'
  },
  metadata: {
    provider: 'stripe'
  }
};

const payoutRecord = {
  payout_id: 'payout_1001',
  provider: 'paypal',
  status: 'PENDING_APPROVAL',
  risk_decision: 'REVIEW',
  summary: {
    receiver: 'recipient@example.com',
    recipient_type: 'EMAIL',
    amount: '75.00',
    currency: 'USD',
    total_debit: '76.25'
  },
  pricing: {
    fee: '1.25'
  },
  tracking: {
    sender_batch_id: 'batch_1001',
    payout_batch_id: 'paypal_batch_1001',
    payout_item_id: 'paypal_item_1001'
  },
  official_paypal: {
    provider_item_status: 'PENDING',
    provider_batch_status: 'PROCESSING',
    last_synced_at: '2026-05-10T12:00:00.000Z',
    remediation: {
      reason: 'Manual review required before provider submission.'
    }
  },
  metadata: {}
};

const cryptoPayoutRecord = {
  payout_id: 'crypto_payout_1002',
  provider: 'crypto',
  status: 'COMPLETED',
  summary: {
    receiver: 'wallet@example.com',
    recipient_type: 'WALLET',
    amount: '42.00',
    currency: 'USD',
    total_debit: '42.00'
  },
  metadata: {
    provider: 'crypto'
  }
};

const stripePaymentIssue = {
  payment_issue_id: 'issue_stripe_1001',
  provider: 'stripe',
  entity_type: 'invoice',
  entity_id: 'stripe_invoice_1002',
  issue_type: 'webhook_delay',
  severity: 'high',
  status: 'open',
  summary: 'Stripe webhook delivery is delayed',
  metadata: {
    provider: 'stripe'
  },
  created_at: '2026-05-11T12:04:00.000Z',
  updated_at: '2026-05-11T12:05:00.000Z'
};

const webhookEvents = [
  {
    webhook_event_id: 'webhook_stripe_1001',
    provider: 'stripe',
    event_type: 'stripe.invoice.paid',
    status: 'PROCESSED',
    created_at: '2026-05-11T12:01:00.000Z',
    processed_at: '2026-05-11T12:01:20.000Z'
  },
  {
    webhook_event_id: 'webhook_stripe_1002',
    provider: 'stripe',
    event_type: 'stripe.invoice.payment_failed',
    status: 'FAILED',
    last_error: 'Signature retry',
    created_at: '2026-05-11T12:02:00.000Z'
  }
];

function buildWebhookDetail(event, overrides = {}) {
  const source = event || webhookEvents[0];
  const isProcessed = source.status === 'PROCESSED';

  return {
    ...source,
    event_id: source.event_id || `stripe:${source.webhook_event_id}`,
    resource_type: 'invoice',
    processing_attempts: source.processing_attempts ?? (isProcessed ? 1 : 2),
    can_replay: source.status !== 'REJECTED',
    can_ignore: !['IGNORED', 'PROCESSED'].includes(source.status),
    sanitized_payload: {
      has_payload: true,
      id: source.webhook_event_id === 'webhook_stripe_1002' ? 'evt_stripe_1002' : 'evt_stripe_1001',
      type: source.event_type,
      provider: source.provider,
      resource_id: source.webhook_event_id === 'webhook_stripe_1002' ? 'stripe_invoice_1002' : 'stripe_invoice_1001',
      resource_type: 'invoice',
      top_level_keys: ['id', 'type', 'provider', 'data']
    },
    verification: {
      has_verification_payload: true,
      verification_status: 'verified',
      signature_header_present: true,
      transmission_id_present: false
    },
    ...overrides
  };
}

const receiptRecord = {
  id: 'receipt_existing_1001',
  type: 'bank',
  title: 'Bank Transfer Slip - Ada Lovelace',
  summary: {
    text: 'Project milestone payment'
  },
  data: {
    details: {
      senderName: 'Ada Lovelace',
      senderAccount: '1002003004',
      senderBank: 'Transferly Wallet',
      receiverName: 'Grace Hopper',
      receiverAccount: '4003002001',
      receiverBank: 'Opay',
      amount: '25000',
      transactionDate: '2026-05-28',
      transactionTime: '10:00',
      transactionRef: 'TRXEXISTING1001',
      narration: 'Project milestone payment',
      sessionId: 'SESSION1',
      status: 'Successful'
    }
  },
  created_at: '2026-05-28T10:00:00.000Z'
};

async function mockTransferlyApi(page, options = {}) {
  const { seedTokens = true, onTelegramMiniAppLogin } = options;

  if (seedTokens) {
    await page.addInitScript(() => {
      window.localStorage.setItem('transferly_api_token', 'test-user-token');
      window.localStorage.setItem('transferly_admin_api_token', 'test-admin-token');
    });
  }

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    const json = (payload) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });

    if (path === '/api/bootstrap') {
      await json({
        platform: {
          platform_name: 'Transferly',
          brand_color: '#f8812d',
          bank_slip_cost: 10,
          email_receipt_cost: 5
        },
        faqs: [],
        testimonials: []
      });
      return;
    }

    if (path === '/api/me') {
      await json({
        user: adminUser,
        profile: adminProfile,
        points: { balance: 5000 },
        referrals: {},
        receipts: [receiptRecord],
        topUpOrders: []
      });
      return;
    }

    if (path === '/api/auth/telegram-mini-app') {
      onTelegramMiniAppLogin?.(route.request().postDataJSON());
      await json({
        token: 'telegram-user-token',
        user: adminUser
      });
      return;
    }

    if (path === '/api/receipt/generate') {
      await json({
        receipt: {
          id: 'receipt_generated_1001',
          type: 'bank',
          title: 'Bank Transfer Slip - Ada Lovelace',
          summary: {
            text: 'Project milestone payment'
          },
          data: receiptRecord.data,
          created_at: '2026-05-28T10:00:00.000Z'
        },
        summary: {
          remaining_points: 4990
        }
      });
      return;
    }

    if (path === '/api/user/me/top-up-orders' && route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      await json({
        order: {
          order_id: 'order_miniapp_1001',
          points: body.points,
          amount_label: body.amountLabel,
          method_id: body.methodId,
          method_title: body.methodTitle,
          service_intent: body.serviceIntent,
          vendor_url: body.vendorUrl,
          instructions: body.instructions,
          status: 'pending',
          created_at: '2026-05-28T11:00:00.000Z'
        }
      });
      return;
    }

    if (path === '/api/admin/users') {
      await json({ data: [adminUser] });
      return;
    }

    if (path === '/api/admin/invoices' || path === '/api/invoices') {
      await json({
        data: [invoiceRecord, stripeInvoiceRecord],
        pagination: { page: 1, page_size: 50, total: 2, has_next_page: false }
      });
      return;
    }

    if (path === '/api/admin/payouts' || path === '/api/payouts') {
      await json({
        data: [payoutRecord, cryptoPayoutRecord],
        pagination: { page: 1, page_size: 50, total: 2, has_next_page: false }
      });
      return;
    }

    if (path === '/api/admin/invoice-reminders') {
      await json({ data: [] });
      return;
    }

    if (path === '/api/admin/invoice-templates') {
      await json({
        data: [
          {
            id: 'template_1001',
            name: 'Standard Service Invoice',
            currency_code: 'USD',
            default_due_days: 7,
            is_active: true,
            line_items: [{ name: 'Service', quantity: 1, unitAmount: 150 }]
          }
        ]
      });
      return;
    }

    if (path === '/api/admin/payment-issues') {
      const provider = url.searchParams.get('provider');
      const issues = provider
        ? [stripePaymentIssue].filter((issue) => issue.provider === provider)
        : [stripePaymentIssue];
      await json({ data: issues });
      return;
    }

    if (path === '/api/admin/top-up-orders') {
      await json({ data: [] });
      return;
    }

    if (path.startsWith('/api/admin/payment-providers/') && path.endsWith('/balance')) {
      const segments = path.split('/');
      const provider = segments[segments.length - 2];
      const balances = {
        paypal: { available_balance_cents: 125000, currency: 'USD' },
        stripe: { available_balance_cents: 321050, currency: 'USD' },
        crypto: { available_balance_cents: 8400, currency: 'USD' },
        paystack: { available_balance_cents: 0, currency: 'USD' },
        flutterwave: { available_balance_cents: 0, currency: 'USD' },
        wise: { available_balance_cents: 0, currency: 'USD' }
      };
      await json({ balance: balances[provider] || balances.paypal });
      return;
    }

    if (path === '/api/admin/payment-providers') {
      await json({
        data: [
          { key: 'paypal', label: 'PayPal', status: 'ready', capabilities: ['invoices', 'payouts', 'webhooks'] },
          { key: 'stripe', label: 'Stripe', status: 'degraded', capabilities: ['invoices', 'connect', 'webhooks'] },
          { key: 'crypto', label: 'Crypto', status: 'ready', capabilities: ['charges', 'webhooks'] }
        ]
      });
      return;
    }

    if (path === '/api/admin/payment-providers/invoice-features') {
      await json({ data: [] });
      return;
    }

    if (path.startsWith('/api/admin/webhooks/')) {
      const segments = path.split('/').filter(Boolean);
      const webhookEventId = decodeURIComponent(segments[3] || '');
      const action = segments[4] || '';
      const event = webhookEvents.find((item) => item.webhook_event_id === webhookEventId || item.event_id === webhookEventId);

      if (action === 'replay') {
        await json({
          event: buildWebhookDetail(event, {
            status: 'IGNORED',
            last_error: null,
            processing_attempts: 3,
            can_ignore: false
          })
        });
        return;
      }

      if (action === 'ignore') {
        await json({
          event: buildWebhookDetail(event, {
            status: 'IGNORED',
            last_error: null,
            can_ignore: false
          })
        });
        return;
      }

      await json({ event: buildWebhookDetail(event) });
      return;
    }

    if (path === '/api/admin/webhooks') {
      const provider = url.searchParams.get('provider');
      const events = provider
        ? webhookEvents.filter((event) => event.provider === provider)
        : webhookEvents;
      await json({ data: events });
      return;
    }

    await json({ data: [] });
  });
}

test('home page renders the primary Transferly launch surface', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Transferly/i);
  await expect(
    page.getByRole('heading', { name: 'The All-in-One Digital Services Platform' })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get Started Free' })).toBeVisible();
  await expect(page.getByText('Supported Platforms')).toBeVisible();
});

test('mini app command center renders with mocked account data', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp');

  await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
  await expect(page.getByText(/Telegram session detected|Browser preview mode/)).toBeVisible();
  await expect(page.getByText('Admin Operator')).toBeVisible();
  await expect(page.getByText('5,000 pts')).toBeVisible();
  await expect(page.getByRole('link', { name: /Generate receipt/i })).toBeVisible();
});

test('mini app provider command center scopes provider operations', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp/ops');

  await expect(page.getByRole('heading', { name: 'Provider Command', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Provider Command Center' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Stripe/i })).toBeVisible();

  await page.getByRole('button', { name: /Stripe/i }).click();

  await expect(page.getByText('Stripe webhook delivery is delayed')).toBeVisible();
  await expect(
    page
      .locator('section')
      .filter({ hasText: 'Provider invoices' })
      .getByRole('article')
      .filter({ hasText: 'stripe_invoice_1002' })
  ).toBeVisible();
  await expect(page.getByText('$3,210.50')).toBeVisible();
  await expect(page.getByText('Webhook health', { exact: true })).toBeVisible();

  const failedWebhook = page
    .getByRole('article')
    .filter({ hasText: 'stripe.invoice.payment_failed' })
    .first();
  await failedWebhook.getByRole('button', { name: /Details/i }).click();
  const webhookDetail = page.getByRole('article').filter({ hasText: 'Webhook detail' });
  await expect(webhookDetail).toBeVisible();
  await expect(webhookDetail.getByText('evt_stripe_1002')).toBeVisible();
  await expect(webhookDetail.getByText('Signature retry')).toBeVisible();

  await webhookDetail.getByRole('button', { name: /Replay/i }).click();
  await expect(page.getByText('Webhook replay queued')).toBeVisible();
});

for (const width of [360, 390, 430]) {
  test(`mini app provider command center remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await mockTransferlyApi(page);
    await page.goto('/miniapp/ops');

    await expect(page.getByRole('heading', { name: 'Provider Command', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stripe/i })).toBeVisible();

    await page.getByRole('button', { name: /Stripe/i }).click();

    await expect(page.getByText('Stripe webhook delivery is delayed')).toBeVisible();
    await expect(page.getByText('$3,210.50')).toBeVisible();
    await expect(page.getByText('Webhook health', { exact: true })).toBeVisible();
  });
}

test('mini app exchanges Telegram init data for a Transferly session on launch', async ({ page }) => {
  let telegramLoginBody = null;

  await mockTransferlyApi(page, {
    seedTokens: false,
    onTelegramMiniAppLogin: (body) => {
      telegramLoginBody = body;
    }
  });

  await page.route('https://telegram.org/js/telegram-web-app.js', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        const initData = 'query_id=telegram-test&user=%7B%22id%22%3A9001%2C%22first_name%22%3A%22Mini%22%2C%22last_name%22%3A%22User%22%7D&auth_date=1770000000&hash=test-signature';
        window.Telegram = {
          WebApp: {
            initData,
            initDataUnsafe: {
              start_param: 'wallet',
              user: {
                id: 9001,
                first_name: 'Mini',
                last_name: 'User',
                username: 'mini_user'
              }
            },
            themeParams: {},
            ready() {},
            expand() {},
            setHeaderColor() {},
            setBackgroundColor() {},
            BackButton: {
              show() {},
              hide() {},
              onClick() {},
              offClick() {}
            },
            SettingsButton: {
              show() {},
              hide() {},
              onClick() {},
              offClick() {}
            },
            MainButton: {
              setText() {},
              enable() {},
              show() {},
              hide() {},
              onClick() {},
              offClick() {},
              hideProgress() {}
            },
            HapticFeedback: {
              impactOccurred() {},
              notificationOccurred() {}
            }
          }
        };
      `
    });
  });

  await page.goto('/miniapp#tgWebAppStartParam=wallet');

  await expect.poll(() => Boolean(telegramLoginBody?.initData?.includes('query_id=telegram-test'))).toBe(true);
  expect(telegramLoginBody.startParam).toBe('wallet');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('transferly_api_token'))).toBe('telegram-user-token');
  await expect(page.getByText('Telegram session secured')).toBeVisible();
  await expect(page.getByText('Mini User')).toBeVisible();
});

test('mini app honors Telegram launch hash parameters', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp#tgWebAppStartParam=wallet');

  await expect(page.getByRole('heading', { name: 'Points Wallet', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /Create top-up order/i })).toBeVisible();
});

test('mini app support desk renders attached handoff context', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp/support?from=wallet');

  await expect(page.getByRole('heading', { name: 'Support Desk', level: 1 })).toBeVisible();
  await expect(page.getByText('Ready for support handoff')).toBeVisible();
  await expect(page.getByText('Screen: wallet')).toBeVisible();
  await expect(page.getByText('Transferly user: admin@transferly.test')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy support context' })).toBeVisible();
});

test('mini app exposes Telegram settings and saves local preferences', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.route('https://telegram.org/js/telegram-web-app.js', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.__telegramSettings = { shown: false, click: null };
        window.Telegram = {
          WebApp: {
            initData: 'query_id=test',
            initDataUnsafe: {
              user: {
                id: 1001,
                first_name: 'Admin',
                username: 'admin_operator'
              }
            },
            themeParams: {},
            ready() {},
            expand() {},
            SettingsButton: {
              show() {
                window.__telegramSettings.shown = true;
              },
              hide() {
                window.__telegramSettings.shown = false;
              },
              onClick(callback) {
                window.__telegramSettings.click = callback;
              },
              offClick(callback) {
                if (window.__telegramSettings.click === callback) {
                  window.__telegramSettings.click = null;
                }
              }
            },
            MainButton: {
              setText() {},
              enable() {},
              show() {},
              hide() {},
              onClick() {},
              offClick() {},
              hideProgress() {}
            },
            HapticFeedback: {
              impactOccurred() {},
              notificationOccurred() {}
            }
          }
        };
      `
    });
  });

  await page.goto('/miniapp');
  await expect.poll(() => page.evaluate(() => window.__telegramSettings.shown)).toBe(true);
  await expect.poll(() => page.evaluate(() => typeof window.__telegramSettings.click)).toBe('function');

  await page.evaluate(() => window.__telegramSettings.click());
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();

  const hapticsSwitch = page.getByRole('switch', { name: 'Telegram haptics' });
  await expect(hapticsSwitch).toHaveAttribute('aria-checked', 'true');
  await hapticsSwitch.click();
  await expect(hapticsSwitch).toHaveAttribute('aria-checked', 'false');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('transferly_miniapp_haptics_enabled'))).toBe('false');

  await page.locator('section').filter({ hasText: 'Default screen' }).getByRole('button', { name: 'Wallet' }).click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('transferly_miniapp_default_screen'))).toBe('wallet');
});

test('mini app receipt studio generates from the native wizard', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp/studio');

  await expect(page.getByRole('heading', { name: 'Receipt Studio', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: /Continue/i }).click();

  await page.getByLabel('Sender name').fill('Ada Lovelace');
  await page.getByLabel('Receiver name').fill('Grace Hopper');
  await page.getByLabel('Amount').fill('25000');
  await page.getByLabel('Narration').fill('Project milestone payment');
  await page.getByRole('button', { name: /Continue/i }).click();

  await expect(page.getByText('100%')).toBeVisible();
  await page.getByRole('button', { name: /Generate receipt/i }).click();
  await expect(page.getByText('Receipt saved to vault')).toBeVisible();
});

test('mini app receipt vault searches and duplicates a receipt', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp/vault');

  await expect(page.getByRole('heading', { name: 'Receipt Vault', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ada Lovelace to Grace Hopper/i })).toBeVisible();

  await page.getByLabel('Search receipts').fill('Grace');
  await expect(page.getByRole('button', { name: /Ada Lovelace to Grace Hopper/i })).toBeVisible();

  await page.getByRole('button', { name: /Duplicate as template/i }).click();
  await expect(page.getByText('Receipt duplicated')).toBeVisible();
});

test('mini app points wallet creates a native top-up order', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/miniapp/wallet');

  await expect(page.getByRole('heading', { name: 'Points Wallet', level: 1 })).toBeVisible();
  await expect(page.getByText('points ready to spend')).toBeVisible();

  await page.getByRole('button', { name: /250/i }).click();
  await page.getByRole('button', { name: /Crypto Payment/i }).click();
  await page.getByRole('button', { name: /Create top-up order/i }).click();

  await expect(page.getByText('Top-up order created')).toBeVisible();
  const order = page.getByRole('article').filter({ hasText: 'order_miniapp_1001' });
  await expect(order).toBeVisible();
  await expect(order.getByText('250 pts')).toBeVisible();
});

test('admin payments workspace loads and opens an invoice detail drawer', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/admin?tab=payments&section=invoices');

  await expect(page.getByRole('heading', { name: 'PayPal Operations' })).toBeVisible();
  await expect(page.getByText('INV-1001', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Details' }).first().click();

  await expect(page.getByText('Invoice Detail')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'INV-1001' })).toBeVisible();
});

test('PayPal invoice launcher renders the embedded invoice composer', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/services/paypal?view=invoices');

  await expect(page.getByRole('heading', { name: 'PayPal Invoicing', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quick Create Official Invoice' })).toBeVisible();
  await expect(page.getByLabel('Invoice template')).toContainText('Standard Service Invoice');
});

test('PayPal payout launcher renders the sandbox-style workspace', async ({ page }) => {
  await mockTransferlyApi(page);
  await page.goto('/services/paypal?view=payouts');

  await expect(page.getByText('PayPal').first()).toBeVisible();
  await expect(page.getByText('Available balance')).toBeVisible();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Send money from your PayPal balance.')).toBeVisible();
  await page.getByRole('button', { name: 'Activity' }).click();
  await expect(page.getByText('payout_1001')).toBeVisible();
});
