/**
 * Design Tokens — WorkPulse Design System v1.1 (Dok 04, SAD §16.5)
 * Berisi nilai terpusat untuk warna, tipografi, radius, dan spacing.
 */

export const tokens = {
  colors: {
    // Base & Surface
    backgroundBase: '#F7FAF9',
    surface: '#FFFFFF',
    surfaceElevated: '#EFF5F2',
    borderSubtle: '#DCE7E2',
    borderStrong: '#A9C7BC',

    // Text
    textPrimary: '#0E211B',
    textSecondary: '#5C6E68',
    textOnAccent: '#FFFFFF',

    // Brand Accent
    accentPrimary: '#00674D',
    accentSecondary: '#12915F',
    accentGradient: 'linear-gradient(135deg, #00674D 0%, #12915F 100%)',

    // 1. Daily Status (Filled Pill, Solid Dot)
    dailyStatus: {
      GREEN: {
        text: '#15803D',
        background: 'rgba(34, 197, 94, 0.12)',
        border: 'rgba(34, 197, 94, 0.3)',
        dot: '#15803D',
      },
      AMBER: {
        text: '#B45309',
        background: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        dot: '#B45309',
      },
      RED: {
        text: '#B91C1C',
        background: 'rgba(220, 38, 38, 0.12)',
        border: 'rgba(220, 38, 38, 0.3)',
        dot: '#B91C1C',
      },
    },

    // 2. Submission Timing (Outlined Pill, Icon) — Tidak pernah tertukar dengan Daily Status
    submissionTiming: {
      ON_TIME: {
        text: '#0369A1',
        border: '#0369A1',
        icon: 'mdi-check-circle-outline',
        label: 'On-Time',
      },
      LATE: {
        text: '#C2410C',
        border: '#C2410C',
        icon: 'mdi-clock-outline',
        label: 'Late',
      },
      NO_SUBMISSION: {
        text: '#475569',
        border: '#475569',
        icon: 'mdi-minus-circle-outline',
        label: 'No Submission',
      },
    },

    // 3. Blocker Severity
    blockerSeverity: {
      Low: {
        text: '#475569',
        background: 'rgba(100, 116, 139, 0.1)',
      },
      Medium: {
        text: '#A16207',
        background: 'rgba(202, 138, 4, 0.12)',
      },
      High: {
        text: '#C2410C',
        background: 'rgba(194, 65, 12, 0.12)',
      },
      Critical: {
        text: '#B91C1C',
        background: 'rgba(220, 38, 38, 0.12)',
      },
    },

    // Supporting Tags
    tags: {
      blocker: {
        Open: { text: '#475569', background: 'rgba(100, 116, 139, 0.1)' },
        Acknowledged: { text: '#0369A1', background: 'rgba(2, 132, 199, 0.1)' },
        InProgress: { text: '#0369A1', background: 'rgba(2, 132, 199, 0.1)' },
        Resolved: { text: '#15803D', background: 'rgba(34, 197, 94, 0.1)' },
        Closed: { text: '#15803D', background: 'rgba(34, 197, 94, 0.1)' },
        AcceptedRisk: { text: '#7C2D12', background: 'rgba(194, 65, 12, 0.08)' },
      },
      correction: {
        Minor: { text: '#334155', background: 'rgba(51, 65, 85, 0.08)' },
        Material: { text: '#0284C7', background: 'rgba(2, 132, 199, 0.1)' },
      },
      authority: {
        Org: { text: '#00674D', background: 'rgba(0, 103, 77, 0.1)' },
        Project: { text: '#0369A1', background: 'rgba(3, 105, 161, 0.1)' },
      },
    },

    // Semantic feedback
    feedback: {
      danger: '#DC2626',
      warning: '#D97706',
      info: '#0284C7',
      success: '#15803D',
    },
  },

  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },

  radii: {
    card: '10px',
    button: '8px',
    input: '8px',
    pill: '999px',
    modal: '14px',
  },

  motion: {
    duration: '180ms',
    easing: 'ease-out',
  },
} as const;

export type DailyStatus = keyof typeof tokens.colors.dailyStatus;
export type SubmissionTiming = keyof typeof tokens.colors.submissionTiming;
export type BlockerSeverity = keyof typeof tokens.colors.blockerSeverity;
