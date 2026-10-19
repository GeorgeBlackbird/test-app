import type { Match, MatchFilter, MatchStatus } from '../types/matches';

const STATUS_LABELS: Record<MatchStatus, string> = {
  finished: 'Завершён',
  scheduled: 'Запланирован',
  live: 'Идёт',
  postponed: 'Отложен',
};

export function statusLabel(status: MatchStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** Дата и время в часовом поясе устройства. */
export function formatStartsAt(startsAt: string | null): string {
  if (!startsAt) {
    return 'Дата не назначена';
  }

  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) {
    return 'Дата не назначена';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScore(match: Match): string | null {
  if (!match.score) {
    return null;
  }
  return `${match.score.home} : ${match.score.away}`;
}

/**
 * Фильтр:
 * - upcoming — только scheduled (ещё не начались)
 * - finished — только finished
 * - live и postponed — только во «Все» (ни предстоящие, ни завершённые)
 */
export function filterMatches(matches: Match[], filter: MatchFilter): Match[] {
  switch (filter) {
    case 'upcoming':
      return matches.filter((m) => m.status === 'scheduled');
    case 'finished':
      return matches.filter((m) => m.status === 'finished');
    default:
      return matches;
  }
}
